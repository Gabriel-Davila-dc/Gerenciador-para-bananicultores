import { Venda } from './../../models/venda';
import { Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';
import { Salvar } from '../../services/salvar';
import { CommonModule } from '@angular/common';
import { from, Observable } from 'rxjs';
import { UpdateVenda } from '../../components/update-venda/update-venda';

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CardSalvo, CommonModule, UpdateVenda],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {
  vendas$!: Observable<Venda[]>;

  Editando: Venda | null = null;
  email: string = localStorage.getItem('email') || 'Nenhum';

  constructor(private salvar: Salvar) {}

  ngOnInit() {
    this.vendas$ = from(this.salvar.pegarVendas());
    this.email = localStorage.getItem('email') || 'Nenhum';
    console.log(localStorage.getItem('email'));
  }

  apagar(id: number) {
    this.vendas$ = from(this.salvar.apagarVenda(id).then(() => this.salvar.pegarVendas()));
  }

  editarVenda(vendaEditada: Venda) {
    this.Editando = vendaEditada;
    console.log('Editando venda com ID:', vendaEditada.id);
  }
  atualizarVenda(vendaAtualizada: Venda) {
    this.salvar.atualizarVenda(vendaAtualizada);
  }

  fechar() {
    this.Editando = null;
  }
}
