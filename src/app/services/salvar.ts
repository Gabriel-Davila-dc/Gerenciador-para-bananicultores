import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';

@Injectable({
  providedIn: 'root',
})
export class Salvar {
  salvarVenda(venda: Venda): void {
    const vendida = venda;
    const vendasJSON = JSON.stringify(vendida, null, 2);
    const data = localStorage.setItem('venda', vendasJSON);
    console.log('Venda salva:', vendasJSON);
  }
}
