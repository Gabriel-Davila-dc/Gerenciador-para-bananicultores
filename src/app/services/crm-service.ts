import { Injectable } from '@angular/core';
import { ServicoCrm } from '../models/servico-crm';
import type { TipoCadastro } from './cadastros-service';

const CHAVE = 'servicos-crm';

// exemplos que aparecem na primeira vez, só pra tela não abrir vazia
const EXEMPLOS: ServicoCrm[] = [
  {
    id: 1,
    bananal: 'Talhão do Córrego',
    servico: 'Desbrota',
    responsavel: 'Equipe própria',
    dataInicio: '2026-09-14',
    dataFim: '2026-09-16',
    descricao: 'Deixar só mãe, filho e neto por touceira.',
    etapa: 'Planejado',
  },
  {
    id: 2,
    bananal: 'Bananal da Serra',
    servico: 'Calcário',
    responsavel: 'Cooperativa',
    dataInicio: '2026-09-20',
    dataFim: '',
    descricao: 'Aguardando a entrega do programa de calcário subsidiado.',
    etapa: 'Esperando',
  },
  {
    id: 3,
    bananal: 'Talhão do Córrego',
    servico: 'Combate à Sigatoka',
    responsavel: 'Terceirizado',
    dataInicio: '2026-09-08',
    dataFim: '2026-09-12',
    descricao: 'Segunda aplicação da safra, focar nas folhas mais baixas.',
    etapa: 'Fazendo',
  },
  {
    id: 4,
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
  listar(): ServicoCrm[] {
    const salvos = localStorage.getItem(CHAVE);

    if (!salvos) {
      this.guardar(EXEMPLOS);
      return [...EXEMPLOS];
    }

    return JSON.parse(salvos);
  }

  salvar(servico: ServicoCrm): void {
    const servicos = this.listar();
    const index = servicos.findIndex((s) => s.id === servico.id);

    if (index === -1) {
      servico.id = Date.now();
      servicos.push(servico);
    } else {
      servicos[index] = servico;
    }

    this.guardar(servicos);
  }

  apagar(id: number): void {
    this.guardar(this.listar().filter((s) => s.id !== id));
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
