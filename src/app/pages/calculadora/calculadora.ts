import { InputFiltro } from './../../components/input-filtro/input-filtro';
import { Component } from '@angular/core';
import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';

@Component({
  selector: 'app-calculadora',

  imports: [BtnFiltro, InputFiltro],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  // Variaveis que vão para serem escolhidas //
  pergunta1: string = 'Come você negocia';
  name1: string = 'negocia';
  escolha1: string[] = ['Simples', 'Classificada'];

  pergunta2: string = 'Come você mede o preço?';
  name2: string = 'pesa';
  escolha2: string[] = ['Caixa', 'Quilo'];

  inputPrecoCaixa = { name: 'precoCaixa', title: 'Preço da Caixa', result: 'Valor do Quilo:' };
  inputPrecoQuilo = { name: 'precoQuilo', title: 'Preço do Quilo', result: 'Valor da Caixa:' };
  inputPreco!: { name: string; title: string; result: string };

  //variaveis escolhidas vem parar aqui//
  filtroNegocio: string = '';
  filtroPeso: string = '';

  setFiltroNegocio(valor: string) {
    this.filtroNegocio = valor;
  }

  setFiltroPeso(valor: string) {
    this.filtroPeso = valor;
  }
}
