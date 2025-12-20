import { ResumoTotal } from './../../models/resumo-total';
import { CommonModule } from '@angular/common';
import { Venda } from '../../models/venda';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-salvo',
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './card-salvo.html',
  styleUrl: './card-salvo.css',
})
export class CardSalvo {
  @Input() infos!: Venda;
  venda!: Venda;
  minimizado: boolean = true;
  ResumoFinal: ResumoTotal = {
    valor: 0,
    pesos: 0,
    mediaCaixas: 0,
    mediaQuilos: 0,
  };

  ngOnInit() {
    console.log('Vendas recebidas no card:', this.infos);
    this.venda = this.infos;
    this.definir(this.venda);
  }

  verDetalhes() {
    this.minimizado = !this.minimizado;
  }

  definir(venda: Venda): ResumoTotal {
    if (venda.tipo === 'Simples') {
      this.ResumoFinal.valor = venda.simples.valorTotal;
      this.ResumoFinal.pesos = venda.simples.pesoTotal;
      this.ResumoFinal.mediaQuilos = venda.simples.precoQuilo;
    } else {
      this.ResumoFinal.valor = venda.valorTotal.valor;
      this.ResumoFinal.pesos = venda.valorTotal.pesos;
      this.ResumoFinal.mediaQuilos = venda.valorTotal.mediaQuilos;
    }
    return this.ResumoFinal;
  }
}
