import { Injectable } from '@angular/core';
import { Investimento } from '../models/investimento';
import { SincronizacaoService } from './sincronizacao-service';
import { InvestimentosApi } from './investimentos-api';

export const RECURSO_INVESTIMENTOS = 'investimentos';

const CHAVE = 'investimentos';

/**
 * A tela abria com 4 investimentos de exemplo, e eles entravam na fila como se
 * o produtor tivesse criado: cada aparelho ou navegador novo mandava mais uma
 * cópia para o servidor. Os exemplos tinham estes ids fixos, e criação de
 * verdade usa -Date.now(), então dá para achar os que ainda não subiram sem
 * levar registro real junto.
 */
export const IDS_EXEMPLOS_ANTIGOS = [-1, -2, -3, -4];

@Injectable({
  providedIn: 'root',
})
export class InvestimentosService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: InvestimentosApi,
  ) {
    this.descartarExemplosAntigos();

    this.sincronizacao.registrar(RECURSO_INVESTIMENTOS, {
      criar: (dados) => this.api.criar(dados as Investimento),
      editar: (dados) => this.api.editar(dados as Investimento),
      apagar: (id) => this.api.apagar(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarId(idLocal, idServidor),
    });
  }

  async carregarDoServidor(): Promise<void> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.api.listar();
      this.guardar(
        this.sincronizacao.mesclar(RECURSO_INVESTIMENTOS, this.listar(), doServidor),
      );
    } catch {
      // sem servidor: segue com o cache do aparelho
    }
  }

  private trocarId(idLocal: number, idServidor: number): void {
    const investimentos = this.listar();
    const item = investimentos.find((registro) => registro.id === idLocal);

    if (item) {
      item.id = idServidor;
      this.guardar(investimentos);
    }
  }

  listar(): Investimento[] {
    const salvos = localStorage.getItem(CHAVE);

    // sem nada salvo a tela abre vazia: só entra na fila o que o produtor criou
    return salvos ? JSON.parse(salvos) : [];
  }

  salvar(investimento: Investimento): void {
    const investimentos = this.listar();
    const index = investimentos.findIndex((item) => item.id === investimento.id);

    if (index === -1) {
      // negativo enquanto não tem id de servidor
      investimento.id = -Date.now();
      investimentos.push(investimento);
      this.sincronizacao.enfileirar(
        RECURSO_INVESTIMENTOS,
        'criar',
        investimento.id,
        investimento,
      );
    } else {
      investimentos[index] = investimento;

      const criacao = this.sincronizacao.criacaoPendente(RECURSO_INVESTIMENTOS, investimento.id);

      if (criacao) {
        this.sincronizacao.atualizarDados(criacao.id, investimento);
      } else {
        this.sincronizacao.enfileirar(
          RECURSO_INVESTIMENTOS,
          'editar',
          investimento.id,
          investimento,
        );
      }
    }

    this.guardar(investimentos);
  }

  apagar(id: number): void {
    this.guardar(this.listar().filter((item) => item.id !== id));

    const naoEnviado = !!this.sincronizacao.criacaoPendente(RECURSO_INVESTIMENTOS, id);
    this.sincronizacao.removerDoRegistro(RECURSO_INVESTIMENTOS, id);

    if (!naoEnviado) {
      this.sincronizacao.enfileirar(RECURSO_INVESTIMENTOS, 'apagar', id);
    }
  }

  // o aparelho que já abriu a tela guarda os exemplos no cache e, se não
  // sincronizou, também na fila; os dois lugares precisam perdê-los
  private descartarExemplosAntigos(): void {
    this.sincronizacao.descartarCriacoes(RECURSO_INVESTIMENTOS, (op) =>
      IDS_EXEMPLOS_ANTIGOS.includes(op.idLocal),
    );

    const cache = this.listar();
    const semExemplos = cache.filter((item) => !IDS_EXEMPLOS_ANTIGOS.includes(item.id));

    if (semExemplos.length !== cache.length) {
      this.guardar(semExemplos);
    }
  }

  private guardar(investimentos: Investimento[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(investimentos));
  }
}
