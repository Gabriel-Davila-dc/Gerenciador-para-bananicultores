export interface Comprador {
  id: number;
  nome: string;
  telefone: string;
  // data URI já reduzida; vazio quando não tem foto
  foto: string;
}
