import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-filtro',
  imports: [FormsModule, CommonModule],
  templateUrl: './input-filtro.html',
  styleUrl: './input-filtro.css',
})
export class InputFiltro {
  @Input() inputFiltro!: { name: string; title: string };
  @Input() qualidade!: string;

  @Output() valoresEscolhidos = new EventEmitter<number[]>();

  peso!: number;
  preco!: number;
  quantidade!: number;
  resultados: number[] = [0, 0, 0];
  estiloEscolhido: string = 'container-simples';

  ngOnChanges() {
    if (this.qualidade === 'boa') {
      this.estiloEscolhido = 'container-boa';
    } else if (this.qualidade === 'fraca') {
      this.estiloEscolhido = 'container-fraca';
    } else {
      this.estiloEscolhido = 'container-simples';
    }
  }

  atualizaInput() {
    const valores = [this.peso, this.preco, this.quantidade];
    this.valoresEscolhidos.emit(valores); //joga o valor escolhido pro pai, pegando o valor pelo html
  }
}
