import { Results } from './../../components/results/results';
import { InputFiltro } from './../../components/input-filtro/input-filtro';
import { Component } from '@angular/core';
import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';
import { Contas } from '../../services/contas';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calculadora',

  imports: [BtnFiltro, InputFiltro, Results, CommonModule],
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
  valoresBoa: [peso: number, preco: number, quantidade: number] = [0, 0, 0];
  valoresFraca: [peso: number, preco: number, quantidade: number] = [0, 0, 0];
  resultados: [valor: number, peso: number, preco: number] = [0, 0, 0];
  resultadosBoa: [valor: number, peso: number, preco: number] = [0, 0, 0];
  resultadosFraca: [valor: number, peso: number, preco: number] = [0, 0, 0];

  setFiltroNegocio(valor: string) {
    this.filtroNegocio = valor;
    this.calcular(this.valores, 'simples');
  }

  setFiltroPeso(valor: string) {
    this.filtroPeso = valor;
    this.calcular(this.valores, 'simples');
  }

  setValores(valor: number[], tipo: string) {
    if (tipo === 'boa') {
      this.valoresBoa = [valor[0], valor[1], valor[2]];
      this.calcular(this.valoresBoa, tipo);
    } else if (tipo === 'fraca') {
      this.valoresFraca = [valor[0], valor[1], valor[2]];
      this.calcular(this.valoresFraca, tipo);
    } else {
      this.valores = [valor[0], valor[1], valor[2]];
      this.calcular(this.valores, tipo);
    }
  }

  //e chamado sempre que algo mudar//
  calcular(valores: [peso: number, preco: number, quantidade: number], tipo: string) {
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

    if (tipo === 'boa') {
      this.resultadosBoa = [x[0], x[1], x[2]];
      this.resultados =
        this.filtroPeso != 'Quilo'
          ? (c.mediaCaixa(this.resultadosBoa, this.resultadosFraca) as [number, number, number])
          : (c.mediaQuilo(this.resultadosBoa, this.resultadosFraca) as [number, number, number]);
    } else if (tipo === 'fraca') {
      this.resultadosFraca = [x[0], x[1], x[2]];
      this.resultados =
        this.filtroPeso != 'Quilo'
          ? (c.mediaCaixa(this.resultadosBoa, this.resultadosFraca) as [number, number, number])
          : (c.mediaQuilo(this.resultadosBoa, this.resultadosFraca) as [number, number, number]);
    } else {
      this.resultados = [x[0], x[1], x[2]];
    }
  }
}
