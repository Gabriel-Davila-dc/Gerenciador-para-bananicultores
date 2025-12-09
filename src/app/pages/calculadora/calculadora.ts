import { Results } from './../../components/results/results';
import { InputFiltro } from './../../components/input-filtro/input-filtro';
import { Component } from '@angular/core';
import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';
import { Contas } from '../../services/contas';

@Component({
  selector: 'app-calculadora',

  imports: [BtnFiltro, InputFiltro, Results],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  // Variaveis que vão para os Componentes de escolha //
  pergunta1: string = 'Come você negocia';
  name1: string = 'negocia';
  escolha1: string[] = ['Simples', 'Classificada'];

  pergunta2: string = 'Come você mede o preço?';
  name2: string = 'pesa';
  escolha2: string[] = ['Caixa', 'Quilo'];

  // Variáveis que vão  para o Input Filtro e Results//
  inputPrecoCaixa = { name: 'precoCaixa', title: 'Preço da Caixa', result: 'Valor do Quilo:' };
  inputPrecoQuilo = { name: 'precoQuilo', title: 'Preço do Quilo', result: 'Valor da Caixa:' };
  inputPreco!: { name: string; title: string; result: string };

  //variaveis escolhidas vem parar aqui//
  filtroNegocio: string = '';
  filtroPeso: string = '';
  valores: [peso: number, preco: number, quantidade: number] = [0, 0, 0];
  resultados: [valor: number, peso: number, preco: number] = [0, 0, 0];

  setFiltroNegocio(valor: string) {
    this.filtroNegocio = valor;
    this.calcular(this.valores);
  }

  setFiltroPeso(valor: string) {
    this.filtroPeso = valor;
    this.calcular(this.valores);
  }

  setValores(valor: number[]) {
    this.valores = [valor[0], valor[1], valor[2]];

    this.calcular(this.valores);
  }

  //e chamado sempre que algo mudar//
  calcular(valores: [peso: number, preco: number, quantidade: number]) {
    var x: number[] = [0, 0, 0];
    if (!valores[0] || !valores[1]) {
      // ainda não preencheu tudo
      this.resultados = [0, 0, 0];
      return;
    }

    const c = new Contas();

    //Chama o servise para fazer a conta e retornar um array (caixa ou quilo)

    this.filtroPeso != 'Quilo'
      ? (x = c.caixa(valores[0], valores[1], valores[2]))
      : (x = c.quilo(valores[0], valores[1], valores[2]));

    this.resultados = [x[0], x[1], x[2]];
  }
}
