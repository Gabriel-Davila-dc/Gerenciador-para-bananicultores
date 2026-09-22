import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-btn-filtro',
  imports: [FormsModule],
  templateUrl: './btn-filtro.html',
  styleUrl: './btn-filtro.css',
})
export class BtnFiltro {
  @Input() modelo!: number;
  // pré-seleciona uma opção do modelo 1 (usado ao reabrir a calculadora numa
  // venda já existente, que pode ser Classificada); sem valor cai no padrão
  @Input() selecionado: string | null = null;

  //retorna a escolha
  @Output() filtroEscolhido = new EventEmitter<string>();
  escolha: string = '';
  escolhasFiltro: string[] = [];
  negocia: string = 'simples';
  pergunta: string = '';
  name: string = '';

  ngOnInit() {
    this.escolher(this.modelo);
    this.filtroEscolhido.emit(this.escolha);
  }
  atualizaFiltro(escolhido: string) {
    this.filtroEscolhido.emit(escolhido); //joga o valor escolhido pro pai, pegando o valor pelo html
  }

  escolher(modelo: number) {
    if (modelo === 1) {
      this.pergunta = 'Como você negocia?';
      this.name = 'negocia';
      this.escolha = this.selecionado ?? 'Simples';
      this.escolhasFiltro = ['Simples', 'Classificada'];
    } else if (modelo === 2) {
      this.pergunta = 'Como você mede o preço?';
      const name2 = 'pesa';
      this.escolha = 'Caixa';
      this.escolhasFiltro = ['Caixa', 'Quilo'];
    }
  }
}
