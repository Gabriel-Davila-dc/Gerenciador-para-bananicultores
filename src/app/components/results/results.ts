import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-results',
  imports: [],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class Results {
  @Input() inputFiltro!: { name: string; title: string; result: string };
  @Input() resultados!: [peso: number, preco: number, quantidade: number];
}
