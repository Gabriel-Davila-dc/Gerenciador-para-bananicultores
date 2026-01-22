import { ResumoTotal } from './../../models/resumo-total';
import { CommonModule } from '@angular/common';
import { Venda } from '../../models/venda';
import { Component, EventEmitter, Input, Output, output, SimpleChange } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResultCard } from '../result-card/result-card';
import { Formatar } from '../../services/formatar';

@Component({
  selector: 'app-card-salvo',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule, ResultCard],
  templateUrl: './card-salvo.html',
  styleUrl: './card-salvo.css',
})
export class CardSalvo {
  @Input() infos!: Venda;
  @Output() apagarVenda = new EventEmitter<number>();
  formatar = new Formatar();
  venda!: Venda;
  minimizado: boolean = true;
  ResumoFinal: ResumoTotal = {
    valor: 0,
    pesos: 0,
    mediaCaixas: 0,
    mediaQuilos: 0,
  };

  ngOnChanges(changes: SimpleChange) {
    this.venda = this.infos;
    this.definir(this.venda);
    const formatar = new Formatar();
  }

  verDetalhes() {
    this.minimizado = !this.minimizado;
  }

  async apagar() {
    this.apagarVenda.emit(this.venda.id);
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
