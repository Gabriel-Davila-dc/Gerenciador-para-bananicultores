import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-filtro',
  imports: [FormsModule],
  templateUrl: './input-filtro.html',
  styleUrl: './input-filtro.css',
})
export class InputFiltro {
  @Input() inputFiltro!: { name: string; title: string };

  @Output() valoresEscolhidos = new EventEmitter<number[]>();

  peso!: number;
  preco!: number;
  quantidade!: number;
  resultados: number[] = [0, 0, 0];

  atualizaInput() {
    const valores = [this.peso, this.preco, this.quantidade];
    this.valoresEscolhidos.emit(valores); //joga o valor escolhido pro pai, pegando o valor pelo html
  }
}
