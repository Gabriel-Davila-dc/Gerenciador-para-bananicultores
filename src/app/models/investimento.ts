export type SituacaoInvestimento = 'A comprar' | 'Comprado';

export const SITUACOES_INVESTIMENTO: SituacaoInvestimento[] = ['A comprar', 'Comprado'];

export const FORMAS_PAGAMENTO = ['Dinheiro', 'Pix', 'Cartão', 'Boleto', 'A prazo'] as const;

export type FormaPagamento = (typeof FORMAS_PAGAMENTO)[number];

export const UNIDADES = [
  'unidade',
  'saco',
  'caixa',
  'kg',
  'tonelada',
  'litro',
  'metro',
  'diária',
] as const;

export interface Investimento {
  id: number;
  produto: string;
  quantidade: number;
  unidade: string;
  // valor total da compra, não o unitário
  valor: number;
  // aaaa-mm-dd: data da compra, ou a prevista quando ainda é "a comprar"
  data: string;
  formaPagamento: FormaPagamento;
  situacao: SituacaoInvestimento;
  observacao: string;
}
