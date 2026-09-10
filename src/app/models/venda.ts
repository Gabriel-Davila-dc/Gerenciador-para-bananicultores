import { Categoria } from './categoria';
import { ResumoTotal } from './resumo-total';

export interface Venda {
  id?: number;
  // só na tela: indica que ainda não foi enviada ao servidor
  pendente?: boolean;

  nome: string;
  bananal: string;
  // null quando a venda não foi ligada a um comprador cadastrado
  compradorId: number | null;
  pago: boolean;
  data: string;
  tipo: string;

  simples: Categoria;

  boa: Categoria;
  fraca: Categoria;

  valorTotal: ResumoTotal;
}
