import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { CadastrosService, TipoCadastro } from '../../services/cadastros-service';
import { CrmService } from '../../services/crm-service';

interface Grupo {
  tipo: TipoCadastro;
  titulo: string;
  descricao: string;
  icone: string;
  placeholder: string;
  itens: string[];
  novo: string;
}

@Component({
  standalone: true,
  selector: 'app-cadastros',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './cadastros.html',
  styleUrl: './cadastros.css',
})
export class Cadastros {
  grupos: Grupo[] = [
    {
      tipo: 'bananais',
      titulo: 'Bananais',
      descricao: 'Os talhões e áreas onde os serviços acontecem.',
      icone: 'place',
      placeholder: 'Ex.: Talhão do Córrego',
      itens: [],
      novo: '',
    },
    {
      tipo: 'servicos',
      titulo: 'Serviços',
      descricao: 'O que é feito no bananal: desbrota, adubação, colheita...',
      icone: 'construction',
      placeholder: 'Ex.: Desbrota',
      itens: [],
      novo: '',
    },
    {
      tipo: 'trabalhadores',
      titulo: 'Trabalhadores',
      descricao: 'Quem executa: equipe própria, diarista, terceirizado...',
      icone: 'person',
      placeholder: 'Ex.: Equipe própria',
      itens: [],
      novo: '',
    },
  ];

  // item que está sendo renomeado no momento
  editando: { tipo: TipoCadastro; original: string; valor: string } | null = null;

  constructor(
    private cadastros: CadastrosService,
    private crmService: CrmService,
  ) {
    this.grupos.forEach((grupo) => (grupo.itens = this.cadastros.listar(grupo.tipo)));
  }

  adicionar(grupo: Grupo): void {
    grupo.itens = this.cadastros.adicionar(grupo.tipo, grupo.novo);
    grupo.novo = '';
  }

  remover(grupo: Grupo, item: string): void {
    grupo.itens = this.cadastros.remover(grupo.tipo, item);
  }

  editar(grupo: Grupo, item: string): void {
    this.editando = { tipo: grupo.tipo, original: item, valor: item };
  }

  estaEditando(grupo: Grupo, item: string): boolean {
    return this.editando?.tipo === grupo.tipo && this.editando?.original === item;
  }

  confirmarEdicao(grupo: Grupo): void {
    if (!this.editando) {
      return;
    }

    const { original, valor } = this.editando;
    const novo = valor.trim();

    if (novo && novo !== original) {
      grupo.itens = this.cadastros.renomear(grupo.tipo, original, novo);
      // leva o novo nome pros serviços que já usavam o antigo
      this.crmService.atualizarReferencia(grupo.tipo, original, novo);
    }

    this.editando = null;
  }

  cancelarEdicao(): void {
    this.editando = null;
  }
}
