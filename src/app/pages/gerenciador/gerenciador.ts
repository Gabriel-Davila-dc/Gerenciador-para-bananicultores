import { Venda } from './../../models/venda';
import { Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';
import { Salvar } from '../../services/salvar';
import { CommonModule } from '@angular/common';
import { from, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CardSalvo, CommonModule],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {
  vendas$!: Observable<Venda[]>;

  constructor(private salvar: Salvar) {}

  ngOnInit() {
    this.vendas$ = from(this.salvar.pegarVendas());
  }

  apagar(id: number) {
    this.vendas$ = from(this.salvar.apagarVenda(id).then(() => this.salvar.pegarVendas()));
  }
}
