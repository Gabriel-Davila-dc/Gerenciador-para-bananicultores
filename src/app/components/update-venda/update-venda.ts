import { Formatar } from './../../services/formatar';
import { MatCardModule } from '@angular/material/card';
import { Component, EventEmitter, Input, Output, output } from '@angular/core';
import { Venda } from '../../models/venda';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-update-venda',
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  templateUrl: './update-venda.html',
  styleUrl: './update-venda.css',
})
export class UpdateVenda {
  @Input() venda!: Venda;
  @Output() cancela = new EventEmitter<void>();
  @Output() salva = new EventEmitter<Venda>();
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fornatar: Formatar,
  ) {}

  ngOnInit() {
    this.setVariaveis();
  }

  salvar() {
    this.setVenda();
    this.salva.emit(this.venda);
    this.cancela.emit();
  }
  cancelar() {
    this.cancela.emit();
  }

  setVariaveis() {
    const dataIso = this.fornatar.dataBRParaISO(this.venda.data);
    this.form = this.fb.group({
      cliente: [this.venda.nome],
      data: [new Date(dataIso)],
      tipo: [this.venda.tipo],

      // SIMPLES
      simplesPeso: [this.venda.simples.pesoCaixa],

      simplesPrecoCaixa: [this.venda.simples.precoCaixa],

      simplesCaixas: [this.venda.simples.caixas],

      //resultado simples
      simplesResultValor: [this.venda.simples.valorTotal],

      simplesResultQuilo: [this.venda.simples.precoQuilo],

      simplesResultPesoTotal: [this.venda.simples.pesoTotal],

      // BOA
      boaPeso: [this.venda.boa.pesoCaixa],

      boaPrecoCaixa: [this.venda.boa.precoCaixa],

      boaCaixas: [this.venda.boa.caixas],

      //resultado boa
      boaResultValor: [this.venda.boa.valorTotal],

      boaResultQuilo: [this.venda.boa.precoQuilo],

      boaResultPesoTotal: [this.venda.boa.pesoTotal],

      // FRACA
      fracaPeso: [this.venda.fraca.pesoCaixa],

      fracaPrecoCaixa: [this.venda.fraca.precoCaixa],

      fracaCaixas: [this.venda.fraca.caixas],

      // resultado fraca
      fracaResultValor: [this.venda.fraca.valorTotal],

      fracaResultQuilo: [this.venda.fraca.precoQuilo],

      fracaResultPesoTotal: [this.venda.fraca.pesoTotal],

      //Resultado geral
      geralResultValor: [this.venda.valorTotal.valor],
      geralResultPesoTotal: [this.venda.valorTotal.pesos],
      geralResultMediaQuilos: [this.venda.valorTotal.mediaQuilos],
      geralResultMediaCaixas: [this.venda.valorTotal.mediaCaixas],
    });
  }
  setVenda() {
    //venda
    this.venda.nome = this.form.value.cliente;
    this.venda.data = this.form.value.data;
    //simples
    this.venda.simples.pesoCaixa = this.form.value.simplesPeso;
    this.venda.simples.precoCaixa = this.form.value.simplesPrecoCaixa;
    this.venda.simples.caixas = this.form.value.simplesCaixas;
    this.venda.valorTotal.valor = this.form.value.geralResultValor;
    this.venda.valorTotal.pesos = this.form.value.geralResultPesoTotal;
    this.venda.valorTotal.mediaQuilos = this.form.value.geralResultMediaQuilos;
    this.venda.valorTotal.mediaCaixas = this.form.value.geralResultMediaCaixas;
    //boa
    this.venda.boa.pesoCaixa = this.form.value.boaPeso;
    this.venda.boa.precoCaixa = this.form.value.boaPrecoCaixa;
    this.venda.boa.caixas = this.form.value.boaCaixas;
    this.venda.boa.valorTotal = this.form.value.boaResultValor;
    this.venda.boa.precoQuilo = this.form.value.boaResultQuilo;
    this.venda.boa.pesoTotal = this.form.value.boaResultPesoTotal;
    //fraca
    this.venda.fraca.pesoCaixa = this.form.value.fracaPeso;
    this.venda.fraca.precoCaixa = this.form.value.fracaPrecoCaixa;
    this.venda.fraca.caixas = this.form.value.fracaCaixas;
    this.venda.fraca.valorTotal = this.form.value.fracaResultValor;
    this.venda.fraca.precoQuilo = this.form.value.fracaResultQuilo;
    this.venda.fraca.pesoTotal = this.form.value.fracaResultPesoTotal;
  }
}
