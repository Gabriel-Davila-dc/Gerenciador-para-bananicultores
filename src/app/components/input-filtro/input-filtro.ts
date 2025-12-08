import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contas } from '../../services/contas';

@Component({
  selector: 'app-input-filtro',
  imports: [FormsModule],
  templateUrl: './input-filtro.html',
  styleUrl: './input-filtro.css',
})
export class InputFiltro {
  @Input() inputFiltro!: { name: string; title: string; result: string };

  @Output() inputEscolhido = new EventEmitter<number>();

  peso!: number;
  preco!: number;
  quantidade!: number;
  resultados: number[] = [0, 0, 0];

  atualizaInput() {
    this.inputEscolhido.emit(this.peso); //joga o valor escolhido pro pai, pegando o valor pelo html
  }

  calcular(peso: number, preco: number, quantidade: number) {
    if (!this.peso || !this.preco || !this.quantidade) {
      // ainda não preencheu tudo
      this.resultados = [0, 0, 0];
      return;
    }
    const c = new Contas();
    //Chama o servise para fazer a conta e retornar um array
    this.inputFiltro.name === 'precoCaixa'
      ? (this.resultados = c.caixa(peso, preco, quantidade))
      : (this.resultados = c.quilo(peso, preco, quantidade));

    console.log(this.resultados[0]);
  }
}
