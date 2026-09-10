import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { ETAPAS_CRM, EtapaCrm, ServicoCrm } from '../../models/servico-crm';
import { CrmService } from '../../services/crm-service';
import { CadastrosService } from '../../services/cadastros-service';
import { Formatar } from '../../services/formatar';

interface Coluna {
  etapa: EtapaCrm;
  servicos: ServicoCrm[];
}

@Component({
  standalone: true,
  selector: 'app-crm',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, DragDropModule],
  templateUrl: './crm.html',
  styleUrl: './crm.css',
})
export class Crm {
  colunas: Coluna[] = [];
  // null = formulário fechado
  editando: ServicoCrm | null = null;

  bananais: string[] = [];
  servicos: string[] = [];
  trabalhadores: string[] = [];

  constructor(
    private crmService: CrmService,
    private cadastros: CadastrosService,
    protected formatar: Formatar,
  ) {
    this.carregar();
    this.carregarCadastros();
  }

  carregarCadastros(): void {
    this.bananais = this.cadastros.listar('bananais');
    this.servicos = this.cadastros.listar('servicos');
    this.trabalhadores = this.cadastros.listar('trabalhadores');
  }

  // se o card foi salvo com um valor que depois saiu do cadastro,
  // ele continua aparecendo na lista pra não sumir calado ao editar
  opcoesCom(lista: string[], atual: string): string[] {
    if (atual && !lista.includes(atual)) {
      return [atual, ...lista];
    }

    return lista;
  }

  carregar(): void {
    const servicos = this.crmService.listar();

    this.colunas = ETAPAS_CRM.map((etapa) => ({
      etapa,
      servicos: servicos.filter((s) => s.etapa === etapa),
    }));
  }

  novo(): void {
    const hoje = this.formatar.hojeISO();

    this.editando = {
      id: 0,
      bananal: '',
      servico: '',
      responsavel: '',
      dataInicio: hoje,
      dataFim: hoje,
      descricao: '',
      etapa: 'Planejado',
    };
  }

  editar(servico: ServicoCrm): void {
    // clone: se cancelar, o card da tela não fica alterado pela metade
    this.editando = { ...servico };
  }

  salvar(): void {
    if (!this.editando) {
      return;
    }

    this.crmService.salvar(this.editando);
    this.editando = null;
    this.carregar();
  }

  apagar(servico: ServicoCrm): void {
    this.crmService.apagar(servico.id);
    this.editando = null;
    this.carregar();
  }

  fechar(): void {
    this.editando = null;
  }

  soltar(evento: CdkDragDrop<ServicoCrm[]>, etapa: EtapaCrm): void {
    const mudouDeEtapa = evento.previousContainer !== evento.container;

    if (mudouDeEtapa) {
      transferArrayItem(
        evento.previousContainer.data,
        evento.container.data,
        evento.previousIndex,
        evento.currentIndex,
      );
      evento.container.data[evento.currentIndex].etapa = etapa;
    } else {
      moveItemInArray(evento.container.data, evento.previousIndex, evento.currentIndex);
    }

    this.crmService.guardarTodos(this.colunas.flatMap((coluna) => coluna.servicos));

    // mudar de etapa é alteração de dado, então precisa ir para a fila;
    // reordenar dentro da mesma coluna é só posição na tela
    if (mudouDeEtapa) {
      this.crmService.registrarEdicao(evento.container.data[evento.currentIndex]);
    }
  }
}
