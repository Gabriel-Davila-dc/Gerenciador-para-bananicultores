import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-results',
  imports: [CommonModule],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  @Input() inputFiltro!: { name: string; title: string; result: string };
  @Input() resultados!: [peso: number, preco: number, quantidade: number];
  @Input() qualidade!: string;

  estiloEscolhido: string = 'resultado-simples';

  ngOnChanges() {
    if (this.qualidade === 'boa') {
      this.estiloEscolhido = 'resultado-boa';
    } else if (this.qualidade === 'fraca') {
      this.estiloEscolhido = 'resultado-fraca';
    } else {
      this.estiloEscolhido = 'resultado-simples';
    }
  }
}
