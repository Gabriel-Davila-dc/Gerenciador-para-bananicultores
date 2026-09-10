import { Injectable } from '@angular/core';
import { Investimento } from '../models/investimento';
import { SincronizacaoService } from './sincronizacao-service';
import { InvestimentosApi } from './investimentos-api';

export const RECURSO_INVESTIMENTOS = 'investimentos';

const CHAVE = 'investimentos';

// exemplos da primeira vez, pra tela não abrir vazia
const EXEMPLOS: Investimento[] = [
  {
    id: -1,
    produto: 'Adubo NPK 20-05-20',
    quantidade: 40,
    unidade: 'saco',
    valor: 6800,
    data: '2026-08-22',
    formaPagamento: 'A prazo',
    situacao: 'Comprado',
    observacao: 'Parcelado em 3x na cooperativa.',
  },
  {
    id: -2,
    produto: 'Calcário dolomítico',
    quantidade: 12,
    unidade: 'tonelada',
    valor: 2400,
    data: '2026-09-02',
    formaPagamento: 'Boleto',
    situacao: 'Comprado',
    observacao: '',
  },
  {
    id: -3,
    produto: 'Mudas de bananeira',
    quantidade: 500,
    unidade: 'unidade',
    valor: 1750,
    data: '2026-09-30',
    formaPagamento: 'Pix',
    situacao: 'A comprar',
    observacao: 'Para renovar o talhão mais velho.',
  },
  {
    id: -4,
    produto: 'Bomba de irrigação',
    quantidade: 1,
    unidade: 'unidade',
    valor: 3200,
    data: '2026-10-15',
    formaPagamento: 'Cartão',
    situacao: 'A comprar',
    observacao: 'Orçar em pelo menos duas lojas antes.',
  },
];

@Injectable({
  providedIn: 'root',
})
export class InvestimentosService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: InvestimentosApi,
  ) {
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

    if (!salvos) {
      EXEMPLOS.forEach((exemplo) =>
        this.sincronizacao.enfileirar(RECURSO_INVESTIMENTOS, 'criar', exemplo.id, exemplo),
      );

      this.guardar(EXEMPLOS);
      return [...EXEMPLOS];
    }

    return JSON.parse(salvos);
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

  private guardar(investimentos: Investimento[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(investimentos));
  }
}
