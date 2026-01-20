import { Venda } from './../../models/venda';
import { Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';
import { Salvar } from '../../services/salvar';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CardSalvo, CommonModule],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {
  vendas: Venda[] = [];

  constructor(private salvar: Salvar) {}

  ngOnInit() {
    this.pegarVendas();
  }

  pegarVendas() {
    this.vendas = this.salvar.pegarVendas();
  }

  apagar(id: number) {
    this.salvar.apagarVenda(id);
    this.pegarVendas();
  }
}
