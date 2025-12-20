import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';

@Injectable({
  providedIn: 'root',
})
export class Salvar {
  salvarVenda(venda: Venda): void {
    //trás as vendassalvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver vendas joga pro array de vendas "vendidas", ou cria um vazio
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    //colocas as novas vendas no array de vendas
    venda.id = vendidas.length + 1;
    vendidas.push(venda);
    //transforma o array atualizado em Json
    const vendasJSON = JSON.stringify(vendidas, null, 2);
    //salva localmente
    localStorage.setItem('vendas', vendasJSON);
    //só para eu ver no console
    console.log('Venda salva:', vendasJSON);
  }

  pegarVendas(): Venda[] {
    //Pega as vendas Salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver venda, joga no array para retorno
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    return vendidas;
  }

  apagarVenda(id: number): void {
    const vendasSalvas = localStorage.getItem('vendas');
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    const vendasFiltradas = vendidas.filter((venda) => venda.id !== id);
    const vendasJSON = JSON.stringify(vendasFiltradas, null, 2);
    localStorage.setItem('vendas', vendasJSON);
    console.log(`Venda com ID ${id} foi apagada.`);
  }
}
