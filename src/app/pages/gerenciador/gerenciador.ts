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

  ngOnInit() {
    this.pegarVendas();
  }

  pegarVendas() {
    const salvar = new Salvar();
    this.vendas = salvar.pegarVendas();
  }

  apagar(id: number) {
    const salvar = new Salvar();
    salvar.apagarVenda(id);
    this.pegarVendas();
  }
}
