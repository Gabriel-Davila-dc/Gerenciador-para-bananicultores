import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

interface OpcaoGerenciador {
  titulo: string;
  descricao: string;
  icone: string;
  // sem rota = ainda não existe, aparece como "em breve"
  rota?: string;
}

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {
  email = localStorage.getItem('email') || '';

  opcoes: OpcaoGerenciador[] = [
    {
      titulo: 'Histórico',
      descricao: 'Todas as vendas registradas, com edição e exclusão.',
      icone: 'history',
      rota: '/gerenciador/historico',
    },
    {
      titulo: 'Compradores',
      descricao: 'Quem compra sua banana, quanto já levou e o que está em aberto.',
      icone: 'contacts',
      rota: '/gerenciador/compradores',
    },
    {
      titulo: 'CRM de serviços',
      descricao: 'Serviços do bananal por etapa: planejado, esperando, fazendo e finalizado.',
      icone: 'view_kanban',
      rota: '/gerenciador/crm',
    },
    {
      titulo: 'Cadastros',
      descricao: 'Bananais, serviços e trabalhadores que aparecem nas listas do CRM.',
      icone: 'list_alt',
      rota: '/gerenciador/cadastros',
    },
    {
      titulo: 'Métricas',
      descricao: 'Visão geral, vendas no tempo, fluxo de serviços e para onde foi o dinheiro.',
      icone: 'insights',
      rota: '/gerenciador/metricas',
    },
    {
      titulo: 'Investimentos',
      descricao: 'O que já foi comprado para o bananal e o que ainda falta comprar.',
      icone: 'savings',
      rota: '/gerenciador/investimentos',
    },
  ];
}
