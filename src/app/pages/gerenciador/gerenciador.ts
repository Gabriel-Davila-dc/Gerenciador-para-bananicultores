import { Venda } from './../../models/venda';
import { Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CardSalvo],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {
  venda: Venda | null = null;

  ngOnInit() {
    this.venda = this.getVenda();
  }

  getVenda(): Venda | null {
    const vendasJSON = localStorage.getItem('venda');
    return vendasJSON ? (JSON.parse(vendasJSON) as Venda) : null;
  }
}
