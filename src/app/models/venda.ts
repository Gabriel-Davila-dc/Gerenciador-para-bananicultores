import { Categoria } from './categoria';
import { ResumoTotal } from './resumo-total';

export interface Venda {
  id?: string;

  nome: string;
  data: Date;

  boa: Categoria;
  fraca: Categoria;

  valorTotal: ResumoTotal;
}

