export interface VendaApi {
  id: number;
  userId: number;
  cliente: string | null;
  tipo: string;

  tipoSimples: string;
  simplesPeso: number | null;
  simplesPrecoCaixa: number | null;
  simplesCaixas: number | null;
  simplesValorTotal: number | null;
  simplesPesoTotal: number | null;
  simplesPrecoQuilo: number | null;

  tipoBoa: string;
  boaPeso: number | null;
  boaPrecoCaixa: number | null;
  boaCaixas: number | null;
  boaValorTotal: number | null;
  boaPesoTotal: number | null;
  boaPrecoQuilo: number | null;

  tipoFraca: string;
  fracaPeso: number | null;
  fracaPrecoCaixa: number | null;
  fracaCaixas: number | null;
  fracaValorTotal: number | null;
  fracaPesoTotal: number | null;
  fracaPrecoQuilo: number | null;

  valorTotal: number;
  pesoTotal: number;

  mediaQuilo: number;
  mediaCaixa: number;

  createdAt: string;
  updatedAt: string;
}
