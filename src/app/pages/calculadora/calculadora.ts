import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';
import { InputFiltro } from '../../components/input-filtro/input-filtro';
import { Results } from '../../components/results/results';

import { Contas } from '../../services/contas';

/* =====================
   Tipos auxiliares
===================== */

type Valores = [peso: number, preco: number, quantidade: number];
type Resultados = [valor: number, peso: number, preco: number];

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [CommonModule, BtnFiltro, InputFiltro, Results],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  /* =====================
     Perguntas / Filtros
  ===================== */

  pergunta1 = 'Como você negocia?';
  name1 = 'negocia';
  escolha1 = ['Simples', 'Classificada'];

  pergunta2 = 'Como você mede o preço?';
  name2 = 'pesa';
  escolha2 = ['Caixa', 'Quilo'];

  /* =====================
     Inputs
  ===================== */

  inputPrecoCaixa = {
    name: 'precoCaixa',
    title: 'Preço da Caixa',
    result: 'Valor do Quilo:',
  };

  inputPrecoQuilo = {
    name: 'precoQuilo',
    title: 'Preço do Quilo',
    result: 'Valor da Caixa:',
  };

  inputPreco!: { name: string; title: string; result: string };

  /* =====================
     Estados / Valores
  ===================== */

  filtroNegocio = '';
  filtroPeso = '';

  valores: Valores = [0, 0, 0];
  valoresBoa: Valores = [0, 0, 0];
  valoresFraca: Valores = [0, 0, 0];

  resultados: Resultados = [0, 0, 0];
  resultadosBoa: Resultados = [0, 0, 0];
  resultadosFraca: Resultados = [0, 0, 0];

  /* =====================
     Setters de Filtro
  ===================== */

  setFiltroNegocio(valor: string): void {
    this.filtroNegocio = valor;
    this.calcular(this.valores, 'simples');
  }

  setFiltroPeso(valor: string): void {
    this.filtroPeso = valor;
    this.calcular(this.valores, 'simples');
  }

  /* =====================
     Recebe valores dos inputs
  ===================== */

  setValores(valor: number[], tipo: 'boa' | 'fraca' | 'simples'): void {
    // Se não tiver quantidade da fraca, usa a da boa

    const dados: Valores = [valor[0], valor[1], valor[2]];

    switch (tipo) {
      case 'boa':
        this.valoresBoa = dados;
        this.calcular(this.valoresBoa, 'boa');

        // 👇 se fraca ainda não tem peso, copia da boa
        if (!this.valoresFraca[0]) {
          this.valoresFraca = [
            this.valoresBoa[0], // peso copiado
            this.valoresFraca[1],
            this.valoresFraca[2],
          ];
        }

        break;

      case 'fraca':
        this.valoresFraca = dados;
        this.calcular(this.valoresFraca, 'fraca');
        break;

      default:
        this.valores = dados;
        this.calcular(this.valores, 'simples');
    }
  }

  /* =====================
     Cálculo principal
  ===================== */
  calcular(valores: Valores, tipo: 'boa' | 'fraca' | 'simples'): void {
    if (!valores[0] || !valores[1]) {
      this.resultados = [0, 0, 0];
      return;
    }

    const contas = new Contas();
    let resultado: number[];

    resultado =
      this.filtroPeso !== 'Quilo'
        ? contas.caixa(valores[0], valores[1], valores[2])
        : contas.quilo(valores[0], valores[1], valores[2]);

    if (tipo === 'boa') {
      this.resultadosBoa = resultado as Resultados;
    } else if (tipo === 'fraca') {
      this.resultadosFraca = resultado as Resultados;
    } else {
      this.resultados = resultado as Resultados;
      return;
    }

    // Média quando é classificada
    this.resultados =
      this.filtroPeso !== 'Quilo'
        ? (contas.mediaCaixa(this.resultadosBoa, this.resultadosFraca) as Resultados)
        : (contas.mediaQuilo(
            this.resultadosBoa,
            this.resultadosFraca,
            this.valoresBoa[2],
            this.valoresFraca[2]
          ) as Resultados);
  }
}
