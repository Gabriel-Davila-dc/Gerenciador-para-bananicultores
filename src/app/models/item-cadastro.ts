export type TipoCadastro = 'bananais' | 'servicos' | 'trabalhadores';

export interface ItemCadastro {
  id: number;
  tipo: TipoCadastro;
  nome: string;
}
