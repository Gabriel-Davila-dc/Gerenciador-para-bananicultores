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
      descricao: 'Preço médio do quilo, volume por safra e comparação entre períodos.',
      icone: 'insights',
    },
    {
      titulo: 'Investimentos',
      descricao: 'Custos do bananal, insumos e o retorno de cada aplicação.',
      icone: 'savings',
    },
  ];
}
