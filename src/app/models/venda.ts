import { Categoria } from './categoria';
import { ResumoTotal } from './resumo-total';

export interface Venda {
  id?: number;

  nome: string;
  data: string;
  tipo: string;

  simples: Categoria;

  boa: Categoria;
  fraca: Categoria;

  valorTotal: ResumoTotal;
}
