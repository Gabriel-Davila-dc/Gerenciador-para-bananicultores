import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CalculadoraForm } from '../../components/calculadora-form/calculadora-form';
import { Venda } from '../../models/venda';
import { Salvar } from '../../services/salvar';

@Component({
  selector: 'app-calculadora',
  standalone: true,
  imports: [RouterModule, CalculadoraForm],
  templateUrl: './calculadora.html',
  styleUrl: './calculadora.css',
})
export class Calculadora {
  //se já tem token salvo, manda pro Gerenciador em vez de Criar conta na landing
  logado = !!localStorage.getItem('token');

  constructor(private salvar: Salvar) {}

  irParaCalculadora(): void {
    document.getElementById('calculadora')?.scrollIntoView({ behavior: 'smooth' });
  }

  salvarVenda(venda: Venda): void {
    this.salvar.salvarVenda(venda);
  }
}
