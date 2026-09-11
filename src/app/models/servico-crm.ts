export type EtapaCrm = 'Planejado' | 'Esperando' | 'Fazendo' | 'Finalizado';

export const ETAPAS_CRM: EtapaCrm[] = ['Planejado', 'Esperando', 'Fazendo', 'Finalizado'];

export interface ServicoCrm {
  id: number;
  bananal: string;
  servico: string;
  responsavel: string;
  // guardadas no formato do input date (aaaa-mm-dd)
  dataInicio: string;
  dataFim: string;
  // dias de dentro do intervalo em que o serviço não aconteceu, no mesmo
  // formato aaaa-mm-dd: a desfolha de segunda a sexta que pulou a quarta
  // continua sendo um serviço só, com um buraco
  diasPulados: string[];
  descricao: string;
  etapa: EtapaCrm;
}
