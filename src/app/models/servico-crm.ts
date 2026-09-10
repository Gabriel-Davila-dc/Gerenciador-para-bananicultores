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
  descricao: string;
  etapa: EtapaCrm;
}
