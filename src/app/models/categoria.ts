export interface Categoria {
  tipo: 'boa' | 'fraca' | 'simples';
  pesoCaixa: number;
  precoCaixa: number;
  caixas: number;

  valorTotal: number;
  pesoTotal: number;
  precoQuilo: number;
}
