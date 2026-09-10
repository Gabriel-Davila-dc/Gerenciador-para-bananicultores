import { Injectable } from '@angular/core';
import { ItemCadastro, TipoCadastro } from '../models/item-cadastro';
import { SincronizacaoService } from './sincronizacao-service';
import { CadastrosApi } from './cadastros-api';

export type { TipoCadastro } from '../models/item-cadastro';

export const RECURSO_CADASTROS = 'cadastros';

const CHAVE = 'cadastros-cache';
// formato antigo: uma chave por tipo, guardando só os nomes
const CHAVE_ANTIGA = (tipo: TipoCadastro) => `cadastro-${tipo}`;

// listas iniciais, pra tela não abrir vazia. o usuário pode apagar e criar as dele.
const PADROES: Record<TipoCadastro, string[]> = {
  bananais: ['Bananal da Serra', 'Talhão do Córrego', 'Talhão Novo'],
  servicos: [
    'Adubação',
    'Calcário',
    'Colheita',
    'Combate à Sigatoka',
    'Desbrota',
    'Ensacamento de cachos',
    'Irrigação',
    'Roçada',
  ],
  trabalhadores: ['Cooperativa', 'Diarista', 'Equipe própria', 'Terceirizado'],
};

@Injectable({
  providedIn: 'root',
})
export class CadastrosService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: CadastrosApi,
  ) {
    this.migrarFormatoAntigo();

    this.sincronizacao.registrar(RECURSO_CADASTROS, {
      criar: (dados) => this.api.criar(dados as ItemCadastro),
      editar: (dados) => this.api.editar(dados as ItemCadastro),
      apagar: (id) => this.api.apagar(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarId(idLocal, idServidor),
    });
  }

  // ----- leitura (síncrona, direto do cache) -----

  listar(tipo: TipoCadastro): ItemCadastro[] {
    const itens = this.cache().filter((item) => item.tipo === tipo);
    return itens.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  // para os campos que só precisam do nome (calculadora, CRM, métricas)
  listarNomes(tipo: TipoCadastro): string[] {
    return this.listar(tipo).map((item) => item.nome);
  }

  // ----- escrita -----

  adicionar(tipo: TipoCadastro, nome: string): ItemCadastro[] {
    const limpo = nome.trim();

    if (!limpo) {
      return this.listar(tipo);
    }

    // compara sem diferenciar maiúscula, senão "Desbrota" e "desbrota" viram dois
    const jaExiste = this.listar(tipo).some(
      (item) => item.nome.toLowerCase() === limpo.toLowerCase(),
    );

    if (!jaExiste) {
      const novo: ItemCadastro = { id: -Date.now(), tipo, nome: limpo };

      this.guardar([...this.cache(), novo]);
      this.sincronizacao.enfileirar(RECURSO_CADASTROS, 'criar', novo.id, novo);
    }

    return this.listar(tipo);
  }

  renomear(tipo: TipoCadastro, id: number, novoNome: string): ItemCadastro[] {
    const nome = novoNome.trim();
    const cache = this.cache();
    const item = cache.find((registro) => registro.id === id);

    if (!nome || !item || item.nome === nome) {
      return this.listar(tipo);
    }

    // renomeou para um nome que já existe: junta os dois, tirando este
    const duplicado = cache.find(
      (registro) =>
        registro.tipo === tipo &&
        registro.id !== id &&
        registro.nome.toLowerCase() === nome.toLowerCase(),
    );

    if (duplicado) {
      return this.remover(tipo, id);
    }

    item.nome = nome;
    this.guardar(cache);

    const criacao = this.sincronizacao.criacaoPendente(RECURSO_CADASTROS, id);

    if (criacao) {
      // ainda não existe no servidor: muda o conteúdo da criação pendente
      this.sincronizacao.atualizarDados(criacao.id, item);
    } else {
      this.sincronizacao.enfileirar(RECURSO_CADASTROS, 'editar', id, item);
    }

    return this.listar(tipo);
  }

  remover(tipo: TipoCadastro, id: number): ItemCadastro[] {
    this.guardar(this.cache().filter((item) => item.id !== id));

    const naoEnviado = !!this.sincronizacao.criacaoPendente(RECURSO_CADASTROS, id);
    this.sincronizacao.removerDoRegistro(RECURSO_CADASTROS, id);

    if (!naoEnviado) {
      this.sincronizacao.enfileirar(RECURSO_CADASTROS, 'apagar', id);
    }

    return this.listar(tipo);
  }

  // ----- servidor -----

  async carregarDoServidor(): Promise<void> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.api.listar();
      this.guardar(this.sincronizacao.mesclar(RECURSO_CADASTROS, this.cache(), doServidor));
    } catch {
      // sem servidor: segue com o cache do aparelho
    }
  }

  // ----- interno -----

  private trocarId(idLocal: number, idServidor: number): void {
    const cache = this.cache();
    const item = cache.find((registro) => registro.id === idLocal);

    if (item) {
      item.id = idServidor;
      this.guardar(cache);
    }
  }

  private cache(): ItemCadastro[] {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
      return JSON.parse(salvo);
    }

    // primeira vez: semeia os padrões como itens criados offline
    const iniciais: ItemCadastro[] = [];

    (Object.keys(PADROES) as TipoCadastro[]).forEach((tipo) => {
      PADROES[tipo].forEach((nome, indice) => {
        iniciais.push({ id: -(Date.now() + iniciais.length + indice), tipo, nome });
      });
    });

    this.guardar(iniciais);
    iniciais.forEach((item) =>
      this.sincronizacao.enfileirar(RECURSO_CADASTROS, 'criar', item.id, item),
    );

    return iniciais;
  }

  private guardar(itens: ItemCadastro[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  }

  // converte quem já usava o app no formato de listas de nomes
  private migrarFormatoAntigo(): void {
    const tipos: TipoCadastro[] = ['bananais', 'servicos', 'trabalhadores'];
    const antigos = tipos.filter((tipo) => localStorage.getItem(CHAVE_ANTIGA(tipo)));

    if (antigos.length === 0) {
      return;
    }

    const cache = localStorage.getItem(CHAVE) ? this.cache() : [];

    antigos.forEach((tipo) => {
      const nomes: string[] = JSON.parse(localStorage.getItem(CHAVE_ANTIGA(tipo))!);

      nomes.forEach((nome, indice) => {
        const item: ItemCadastro = { id: -(Date.now() + cache.length + indice), tipo, nome };
        cache.push(item);
        this.sincronizacao.enfileirar(RECURSO_CADASTROS, 'criar', item.id, item);
      });

      localStorage.removeItem(CHAVE_ANTIGA(tipo));
    });

    this.guardar(cache);
  }
}
