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
  @Input() valores!: any[];

  @Output() valoresEscolhidos = new EventEmitter<number[]>();

  peso: number = this.valores ? this.valores[0] : null;
  preco: number = this.valores ? this.valores[1] : null;
  quantidade: number = this.valores ? this.valores[2] : null;
  resultados: number[] = [0, 0, 0];
  estiloEscolhido: string = 'container-simples';

  ngOnChanges() {
    this.peso = this.valores && this.valores[0] !== 0 ? this.valores[0] : null;
    this.preco = this.valores && this.valores[1] !== 0 ? this.valores[1] : null;
    this.quantidade = this.valores && this.valores[2] !== 0 ? this.valores[2] : null;

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
