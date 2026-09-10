import { Injectable } from '@angular/core';
import { ServicoCrm } from '../models/servico-crm';
import type { TipoCadastro } from './cadastros-service';
import { SincronizacaoService } from './sincronizacao-service';
import { ServicosApi } from './servicos-api';

export const RECURSO_CRM = 'crm';

const CHAVE = 'servicos-crm';

// exemplos que aparecem na primeira vez, só pra tela não abrir vazia
const EXEMPLOS: ServicoCrm[] = [
  {
    id: -1,
    bananal: 'Talhão do Córrego',
    servico: 'Desbrota',
    responsavel: 'Equipe própria',
    dataInicio: '2026-09-14',
    dataFim: '2026-09-16',
    descricao: 'Deixar só mãe, filho e neto por touceira.',
    etapa: 'Planejado',
  },
  {
    id: -2,
    bananal: 'Bananal da Serra',
    servico: 'Calcário',
    responsavel: 'Cooperativa',
    dataInicio: '2026-09-20',
    dataFim: '',
    descricao: 'Aguardando a entrega do programa de calcário subsidiado.',
    etapa: 'Esperando',
  },
  {
    id: -3,
    bananal: 'Talhão do Córrego',
    servico: 'Combate à Sigatoka',
    responsavel: 'Terceirizado',
    dataInicio: '2026-09-08',
    dataFim: '2026-09-12',
    descricao: 'Segunda aplicação da safra, focar nas folhas mais baixas.',
    etapa: 'Fazendo',
  },
  {
    id: -4,
    bananal: 'Talhão Novo',
    servico: 'Roçada',
    responsavel: 'Diarista',
    dataInicio: '2026-08-28',
    dataFim: '2026-08-30',
    descricao: 'Roçada entre as linhas antes da adubação.',
    etapa: 'Finalizado',
  },
];

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: ServicosApi,
  ) {
    this.sincronizacao.registrar(RECURSO_CRM, {
      criar: (dados) => this.api.criar(dados as ServicoCrm),
      editar: (dados) => this.api.editar(dados as ServicoCrm),
      apagar: (id) => this.api.apagar(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarId(idLocal, idServidor),
    });
  }

  // busca no servidor e junta com o que ainda está na fila
  async carregarDoServidor(): Promise<void> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.api.listar();
      this.guardar(this.sincronizacao.mesclar(RECURSO_CRM, this.listar(), doServidor));
    } catch {
      // sem servidor: segue com o cache do aparelho
    }
  }

  private trocarId(idLocal: number, idServidor: number): void {
    const servicos = this.listar();
    const servico = servicos.find((item) => item.id === idLocal);

    if (servico) {
      servico.id = idServidor;
      this.guardar(servicos);
    }
  }

  listar(): ServicoCrm[] {
    const salvos = localStorage.getItem(CHAVE);

    if (!salvos) {
      // os exemplos entram como serviços criados offline: se o usuário
      // mantiver algum, ele sobe junto quando existir backend
      EXEMPLOS.forEach((exemplo) =>
        this.sincronizacao.enfileirar(RECURSO_CRM, 'criar', exemplo.id, exemplo),
      );

      this.guardar(EXEMPLOS);
      return [...EXEMPLOS];
    }

    return JSON.parse(salvos);
  }

  salvar(servico: ServicoCrm): void {
    const servicos = this.listar();
    const index = servicos.findIndex((s) => s.id === servico.id);

    if (index === -1) {
      // negativo, como nas vendas: não colide com id de servidor
      servico.id = -Date.now();
      servicos.push(servico);
      this.sincronizacao.enfileirar(RECURSO_CRM, 'criar', servico.id, servico);
    } else {
      servicos[index] = servico;
      this.registrarEdicao(servico);
    }

    this.guardar(servicos);
  }

  // usado quando o card muda de etapa pelo arrastar, sem passar pelo formulário
  registrarEdicao(servico: ServicoCrm): void {
    const criacao = this.sincronizacao.criacaoPendente(RECURSO_CRM, servico.id);

    if (criacao) {
      // ainda não existe no servidor: atualiza o conteúdo da criação pendente
      this.sincronizacao.atualizarDados(criacao.id, servico);
    } else {
      this.sincronizacao.enfileirar(RECURSO_CRM, 'editar', servico.id, servico);
    }
  }

  apagar(id: number): void {
    this.guardar(this.listar().filter((s) => s.id !== id));

    const naoEnviado = !!this.sincronizacao.criacaoPendente(RECURSO_CRM, id);
    this.sincronizacao.removerDoRegistro(RECURSO_CRM, id);

    if (!naoEnviado) {
      this.sincronizacao.enfileirar(RECURSO_CRM, 'apagar', id);
    }
  }

  // usado quando o card é arrastado de uma coluna pra outra
  guardarTodos(servicos: ServicoCrm[]): void {
    this.guardar(servicos);
  }

  // quando um item do cadastro é renomeado, os serviços que já usavam o nome
  // antigo precisam acompanhar, senão ficariam apontando pra algo que sumiu
  atualizarReferencia(tipo: TipoCadastro, antigo: string, novo: string): void {
    const campo: keyof ServicoCrm =
      tipo === 'bananais' ? 'bananal' : tipo === 'servicos' ? 'servico' : 'responsavel';

    const servicos = this.listar();
    let mudou = false;

    servicos.forEach((servico) => {
      if (servico[campo] === antigo) {
        (servico[campo] as string) = novo;
        mudou = true;
      }
    });

    if (mudou) {
      this.guardar(servicos);
    }
  }

  private guardar(servicos: ServicoCrm[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(servicos));
  }
}
