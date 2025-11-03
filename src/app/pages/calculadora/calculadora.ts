import { Component } from '@angular/core';
import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';

@Component({
  selector: 'app-calculadora',

  imports: [BtnFiltro],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  pergunta1: string = 'Come você negocia';
  name1: string = 'negocia';
  escolha1: string[] = ['Simples', 'Classificada'];

  pergunta2: string = 'Come você mede o preço?';
  name2: string = 'pesa';
  escolha2: string[] = ['Caixa', 'Quilo'];

  filtroNegocio: string = ''; //escolhas escolhidas vem pararaqui
  filtroPeso: string = '';

  setFiltroNegocio(valor: string) {
    this.filtroNegocio = valor;
  }

  setFiltroPeso(valor: string) {
    this.filtroPeso = valor;
  }
}
