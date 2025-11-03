import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-btn-filtro',
  imports: [FormsModule],
  templateUrl: './btn-filtro.html',
  styleUrl: './btn-filtro.css',
})
export class BtnFiltro {
  @Input() perguntaFiltro!: string;
  @Input() nameFiltro!: string;
  @Input() escolhasFiltro!: string[];
  @Output() filtroEscolhido = new EventEmitter<string>();
  escolha: string = '';
  negocia: string = 'simples';

  ngOnInit() {
    this.escolha = this.escolhasFiltro[0]; //deixa os valores setados quando inicia a página (simples / caixa)
    this.filtroEscolhido.emit(this.escolha);
  }
  atualizaFiltro(escolhido: string) {
    this.filtroEscolhido.emit(escolhido); //joga o valor escolhido pro pai, pegando o valor pelo html
  }
}
