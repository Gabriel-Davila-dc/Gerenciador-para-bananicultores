import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { VendaService } from './venda-service';
import { VendaApi } from '../Types/VendaApi';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Formatar } from './formatar';
import { SincronizacaoService } from './sincronizacao-service';

const RECURSO = 'vendas';
const CHAVE_CACHE = 'vendas-cache';
// chave do formato antigo, quando o localStorage guardava só o que faltava enviar
const CHAVE_ANTIGA = 'vendas';

/**
 * Guarda as vendas offline-first: o cache local é o que a tela lê, e toda
 * alteração entra na fila de sincronização para ser enviada quando der.
 */
@Injectable({
  providedIn: 'root',
})
export class Salvar {
  constructor(
    private vendaService: VendaService,
    private snackBar: MatSnackBar,
    private formatar: Formatar,
    private sincronizacao: SincronizacaoService,
  ) {
    this.migrarFormatoAntigo();

    this.sincronizacao.registrar(RECURSO, {
      criar: (dados) => this.vendaService.salvarVenda(dados as Venda),
      editar: (dados) => this.vendaService.atualizarVenda(dados as Venda),
      apagar: (id) => this.vendaService.apagarVenda(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarIdNoCache(idLocal, idServidor),
    });

    this.sincronizacao.sincronizar();
  }

  async salvarVenda(venda: Venda): Promise<void> {
    // id negativo enquanto o servidor não atribui o definitivo;
    // nunca colide com o autoincremento, que é positivo
    venda.id = -Date.now();

    const cache = this.lerCache();
    cache.push(venda);
    this.guardarCache(cache);

    this.sincronizacao.enfileirar(RECURSO, 'criar', venda.id, venda);

    await this.enviarPendentes('Venda salva no aparelho. Vai para o servidor quando conectar.');
  }

  async atualizarVenda(venda: Venda): Promise<void> {
    const cache = this.lerCache();
    const index = cache.findIndex((item) => item.id === venda.id);

    if (index !== -1) {
      cache[index] = venda;
    } else {
      cache.push(venda);
    }

    this.guardarCache(cache);

    // se essa venda ainda nem foi criada no servidor, atualiza o conteúdo da
    // criação pendente: enfileirar uma edição a mandaria antes da criação
    const criacao = this.sincronizacao.criacaoPendente(RECURSO, venda.id!);

    if (criacao) {
      this.sincronizacao.atualizarDados(criacao.id, venda);
    } else {
      this.sincronizacao.enfileirar(RECURSO, 'editar', venda.id!, venda);
    }

    await this.enviarPendentes('Alteração guardada. Vai para o servidor quando conectar.');
  }

  async apagarVenda(id: number): Promise<void> {
    this.guardarCache(this.lerCache().filter((venda) => venda.id !== id));

    // nunca chegou ao servidor: basta cancelar o que estava na fila
    if (this.sincronizacao.criacaoPendente(RECURSO, id)) {
      this.sincronizacao.removerDoRegistro(RECURSO, id);
      return;
    }

    // tira edições pendentes desse registro, que não fazem mais sentido
    this.sincronizacao.removerDoRegistro(RECURSO, id);
    this.sincronizacao.enfileirar(RECURSO, 'apagar', id);

    await this.enviarPendentes('Exclusão guardada. Vai para o servidor quando conectar.');
  }

  async pegarVendas(): Promise<Venda[]> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.vendaService.listarVendas();
      const convertidas = doServidor.map((api) => this.mapVendaApiParaVenda(api));

      // o que ainda não foi enviado só existe aqui e precisa sobreviver ao merge
      const naoEnviadas = this.lerCache().filter((venda) =>
        this.sincronizacao.criacaoPendente(RECURSO, venda.id!),
      );

      // apagadas offline: o servidor ainda devolve, mas não podem reaparecer
      const apagadas = this.sincronizacao.idsComOperacao(RECURSO, 'apagar');
      const doServidorValidas = convertidas.filter((venda) => !apagadas.includes(venda.id!));

      // conflito resolve pelo aparelho: se há edição pendente, ela prevalece
      const editadas = this.sincronizacao.idsComOperacao(RECURSO, 'editar');
      const cache = this.lerCache();
      const comEdicaoLocal = doServidorValidas.map((venda) => {
        if (!editadas.includes(venda.id!)) {
          return venda;
        }

        return cache.find((local) => local.id === venda.id) ?? venda;
      });

      const atualizadas = [...naoEnviadas, ...comEdicaoLocal];
      this.guardarCache(atualizadas);

      return this.marcarPendentes(atualizadas);
    } catch (error) {
      // sem servidor: mostra o cache do jeito que está
      this.snackBar.open('Sem conexão. Mostrando o que está salvo no aparelho.', '📴', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });

      return this.marcarPendentes(this.lerCache()).reverse();
    }
  }

  private async enviarPendentes(avisoSeFicouPendente: string): Promise<void> {
    const { pendentes } = await this.sincronizacao.sincronizar();

    if (pendentes > 0) {
      this.snackBar.open(avisoSeFicouPendente, '📴', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    }
  }

  // marca o que ainda não foi para o servidor, sem gravar isso no cache
  private marcarPendentes(vendas: Venda[]): Venda[] {
    return vendas.map((venda) => ({
      ...venda,
      pendente: this.sincronizacao.temPendencia(RECURSO, venda.id!),
    }));
  }

  private trocarIdNoCache(idLocal: number, idServidor: number): void {
    const cache = this.lerCache();
    const venda = cache.find((item) => item.id === idLocal);

    if (venda) {
      venda.id = idServidor;
      this.guardarCache(cache);
    }
  }

  private lerCache(): Venda[] {
    const salvo = localStorage.getItem(CHAVE_CACHE);
    return salvo ? JSON.parse(salvo) : [];
  }

  private guardarCache(vendas: Venda[]): void {
    localStorage.setItem(CHAVE_CACHE, JSON.stringify(vendas));
  }

  // traz para a fila o que estava pendente no formato antigo, para não
  // perder venda de quem já usava o app
  private migrarFormatoAntigo(): void {
    const antigas = localStorage.getItem(CHAVE_ANTIGA);

    if (!antigas) {
      return;
    }

    const vendas: Venda[] = JSON.parse(antigas);
    const cache = this.lerCache();

    vendas.forEach((venda) => {
      venda.id = -Date.now() - Math.floor(Math.random() * 1000);
      cache.push(venda);
      this.sincronizacao.enfileirar(RECURSO, 'criar', venda.id, venda);
    });

    this.guardarCache(cache);
    localStorage.removeItem(CHAVE_ANTIGA);
  }

  //pega os dados do VendaApi(JSON) e converte para Venda
  private mapVendaApiParaVenda(api: VendaApi): Venda {
    return {
      id: api.id,

      nome: api.cliente ?? 'Sem nome',
      bananal: api.bananal ?? '',
      data: this.formatar.data(api.createdAt),
      tipo: api.tipo,

      simples: {
        tipo: api.tipoSimples,
        pesoCaixa: api.simplesPeso ?? 0,
        precoCaixa: api.simplesPrecoCaixa ?? 0,
        caixas: api.simplesCaixas ?? 0,
        valorTotal: api.simplesValorTotal ?? 0,
        pesoTotal: api.simplesPesoTotal ?? 0,
        precoQuilo: api.simplesPrecoQuilo ?? 0,
      },

      boa: {
        tipo: 'Boa',
        pesoCaixa: api.boaPeso ?? 0,
        precoCaixa: api.boaPrecoCaixa ?? 0,
        caixas: api.boaCaixas ?? 0,
        valorTotal: api.boaValorTotal ?? 0,
        pesoTotal: api.boaPesoTotal ?? 0,
        precoQuilo: api.boaPrecoQuilo ?? 0,
      },

      fraca: {
        tipo: 'Fraca',
        pesoCaixa: api.fracaPeso ?? 0,
        precoCaixa: api.fracaPrecoCaixa ?? 0,
        caixas: api.fracaCaixas ?? 0,
        valorTotal: api.fracaValorTotal ?? 0,
        pesoTotal: api.fracaPesoTotal ?? 0,
        precoQuilo: api.fracaPrecoQuilo ?? 0,
      },

      valorTotal: {
        valor: api.valorTotal ?? 0,
        pesos: api.pesoTotal ?? 0,
        mediaQuilos: api.mediaQuilo ?? 0,
        mediaCaixas: api.mediaCaixa ?? 0,
      },
    };
  }
}
