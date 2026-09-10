import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { ItemCadastro, TipoCadastro } from '../../models/item-cadastro';
import { CadastrosService } from '../../services/cadastros-service';
import { CrmService } from '../../services/crm-service';

interface Grupo {
  tipo: TipoCadastro;
  titulo: string;
  descricao: string;
  icone: string;
  placeholder: string;
  itens: ItemCadastro[];
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
  editando: { id: number; valor: string } | null = null;

  constructor(
    private cadastros: CadastrosService,
    private crmService: CrmService,
    private cd: ChangeDetectorRef,
  ) {
    this.recarregar();
    this.sincronizar();
  }

  private async sincronizar(): Promise<void> {
    await this.cadastros.carregarDoServidor();
    this.recarregar();

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  private recarregar(): void {
    this.grupos.forEach((grupo) => (grupo.itens = this.cadastros.listar(grupo.tipo)));
  }

  adicionar(grupo: Grupo): void {
    grupo.itens = this.cadastros.adicionar(grupo.tipo, grupo.novo);
    grupo.novo = '';
  }

  remover(grupo: Grupo, item: ItemCadastro): void {
    grupo.itens = this.cadastros.remover(grupo.tipo, item.id);
  }

  editar(item: ItemCadastro): void {
    this.editando = { id: item.id, valor: item.nome };
  }

  estaEditando(item: ItemCadastro): boolean {
    return this.editando?.id === item.id;
  }

  confirmarEdicao(grupo: Grupo): void {
    if (!this.editando) {
      return;
    }

    const { id, valor } = this.editando;
    const antigo = grupo.itens.find((item) => item.id === id)?.nome ?? '';
    const novo = valor.trim();

    if (novo && novo !== antigo) {
      grupo.itens = this.cadastros.renomear(grupo.tipo, id, novo);
      // leva o nome novo para os serviços que já usavam o antigo
      this.crmService.atualizarReferencia(grupo.tipo, antigo, novo);
    }

    this.editando = null;
  }

  cancelarEdicao(): void {
    this.editando = null;
  }
}
