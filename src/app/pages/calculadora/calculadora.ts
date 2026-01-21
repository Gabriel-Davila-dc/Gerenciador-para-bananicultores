import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BtnFiltro } from '../../components/btn-filtro/btn-filtro';
import { InputFiltro } from '../../components/input-filtro/input-filtro';
import { Results } from '../../components/results/results';

import { Contas } from '../../services/contas';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Venda } from '../../models/venda';
import { Categoria } from '../../models/categoria';
import { ResumoTotal } from '../../models/resumo-total';
import { Salvar } from '../../services/salvar';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

/* =====================
   Tipos auxiliares
===================== */

type Valores = [peso: number, preco: number, quantidade: number];
type Resultados = [valor: number, peso: number, preco: number];

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [
    CommonModule,
    BtnFiltro,
    InputFiltro,
    Results,
    MatButtonModule,
    MatIconModule,
    MatFormField,
    MatInputModule,
    FormsModule,
  ],
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

  moverCaminhao = false;

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
  mediaNaoMostrada: number = 0;

  nome: string = '';
  data: string = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  venda: Venda = this.Vendendo();

  constructor(private salvar: Salvar) {}

  /* =====================
     Setters de Filtro
  ===================== */

  setFiltroNegocio(valor: string): void {
    this.filtroNegocio = valor;
    this.calcular(this.valores, 'simples');
    this.atualizarPagina();
  }

  setFiltroPeso(valor: string): void {
    this.filtroPeso = valor;
    this.calcular(this.valores, 'simples');
    this.atualizarPagina();
  }

  /* =====================
     Recebe valores dos inputs
  ===================== */

  setValores(valor: number[], tipo: 'boa' | 'fraca' | 'simples'): void {
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
    if ((!valores[0] || !valores[1]) && (this.valoresBoa[0] === 0 || this.valoresFraca[0] === 0)) {
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
    const resulMedia: number[] =
      this.filtroPeso !== 'Quilo'
        ? (contas.mediaCaixa(
            this.resultadosBoa,
            this.resultadosFraca,
            this.valoresBoa[2],
            this.valoresFraca[2],
          ) as Resultados)
        : (contas.mediaQuilo(
            this.resultadosBoa,
            this.resultadosFraca,
            this.valoresBoa[2],
            this.valoresFraca[2],
          ) as Resultados);
    this.resultados = [resulMedia[0], resulMedia[1], resulMedia[2]];
    this.mediaNaoMostrada = resulMedia[3];
  }

  /* =====================
     Salvar
  ===================== */

  Vendendo(): Venda {
    //boa
    const Caixaboa: Categoria = {
      tipo: 'boa',
      pesoCaixa: this.valoresBoa[0],
      precoCaixa: this.valoresBoa[1],
      caixas: this.valoresBoa[2],

      valorTotal: this.resultadosBoa[0],
      pesoTotal: this.resultadosBoa[1],
      precoQuilo: this.resultadosBoa[2],
    };

    if (this.filtroPeso === 'Quilo') {
      Caixaboa.precoCaixa = this.resultadosBoa[2];
      Caixaboa.precoQuilo = this.valoresBoa[1];
    }
    //fraca
    const Caixafraca: Categoria = {
      tipo: 'fraca',
      pesoCaixa: this.valoresFraca[0],
      precoCaixa: this.valoresFraca[1],
      caixas: this.valoresFraca[2],

      valorTotal: this.resultadosFraca[0],
      pesoTotal: this.resultadosFraca[1],
      precoQuilo: this.resultadosFraca[2],
    };
    if (this.filtroPeso === 'Quilo') {
      Caixafraca.precoCaixa = this.resultadosFraca[2];
      Caixafraca.precoQuilo = this.valoresFraca[1];
    }

    const CaixaTotal: ResumoTotal = {
      valor: this.resultados[0],
      pesos: this.resultados[1],
      mediaQuilos: this.resultados[2],
      mediaCaixas: this.mediaNaoMostrada,
      //mediaCaixas: this.resultados[3],
    };

    const CaixaSimples: Categoria = {
      tipo: 'Simples',
      pesoCaixa: this.valores[0],
      precoCaixa: this.valores[1],
      caixas: this.valores[2],

      valorTotal: this.resultados[0],
      pesoTotal: this.resultados[1],
      precoQuilo: this.resultados[2],
    };
    if (this.filtroPeso === 'Quilo') {
      Caixafraca.precoCaixa = this.resultados[2];
      Caixafraca.precoQuilo = this.valores[1];
    }

    console.log('Salvando venda...' + this.mediaNaoMostrada);

    const vendida: Venda = {
      nome: this.nome,
      data: this.data,
      tipo: this.filtroNegocio,
      simples: CaixaSimples,
      boa: Caixaboa,
      fraca: Caixafraca,
      valorTotal: CaixaTotal,
    };

    return vendida;
  }

  salvarVenda(): void {
    // se o nome faltar no input, avisa e não deixa salvar
    if (!this.nome) {
      alert('Por favor, insira o nome do comprador antes de salvar a venda.');
      return;
    }
    this.ativarAnimacao();

    //coloca tudo dentro de venda pela função Vendendo
    this.venda = this.Vendendo();
    //manda para o service
    this.salvar.salvarVenda(this.venda);
  }

  ativarAnimacao() {
    this.moverCaminhao = true;

    setTimeout(() => {
      this.moverCaminhao = false;
    }, 0);
  }

  atualizarPagina() {
    this.valoresBoa = [0, 0, 0];
    this.valoresFraca = [0, 0, 0];

    this.resultados = [0, 0, 0];
    this.resultadosBoa = [0, 0, 0];
    this.resultadosFraca = [0, 0, 0];
    this.mediaNaoMostrada = 0;
  }
}
