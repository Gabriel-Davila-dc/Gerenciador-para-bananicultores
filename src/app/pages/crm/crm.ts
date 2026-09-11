import { ChangeDetectorRef, Component } from '@angular/core';
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

export type VisaoCrm = 'calendario' | 'quadro';

interface DiaCalendario {
  iso: string;
  numero: number;
  diaSemana: string;
  hoje: boolean;
  servicos: ServicoCrm[];
}

interface SemanaCalendario {
  dias: DiaCalendario[];
  contemHoje: boolean;
  // preenchido só quando a semana começa um mês novo, para virar cabeçalho
  rotuloMes: string | null;
}

const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

const MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

// quanto o calendário mostra além da semana atual, e quanto cresce por clique
const SEMANAS_ADIANTE = 8;
const SEMANAS_POR_CLIQUE = 4;

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

  /**
   * Calendário é o padrão.
   *
   * O quadro continua existindo porque mostra o andamento por etapa, mas no
   * celular ele exigia rolagem lateral e um arrastar entre colunas fora da
   * tela — gesto que praticamente não se completa no dedo.
   */
  visao: VisaoCrm = 'calendario';

  semanas: SemanaCalendario[] = [];
  // quantas semanas antes da atual já foram carregadas
  private semanasAntes = 1;

  bananais: string[] = [];
  servicos: string[] = [];
  trabalhadores: string[] = [];

  constructor(
    private crmService: CrmService,
    private cadastros: CadastrosService,
    protected formatar: Formatar,
    private cd: ChangeDetectorRef,
  ) {
    // mostra o cache na hora e busca o servidor em seguida
    this.carregar();
    this.carregarCadastros();
    this.sincronizar();
  }

  private async sincronizar(): Promise<void> {
    await this.cadastros.carregarDoServidor();
    await this.crmService.carregarDoServidor();

    this.carregarCadastros();
    this.carregar();

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  carregarCadastros(): void {
    this.bananais = this.cadastros.listarNomes('bananais');
    this.servicos = this.cadastros.listarNomes('servicos');
    this.trabalhadores = this.cadastros.listarNomes('trabalhadores');
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

    this.montarCalendario(servicos);
  }

  // ---------- calendário ----------

  trocarVisao(visao: VisaoCrm): void {
    this.visao = visao;
  }

  carregarSemanaAnterior(): void {
    this.semanasAntes += SEMANAS_POR_CLIQUE;
    this.carregar();
  }

  /**
   * Datas são tratadas como texto "aaaa-mm-dd" e só viram Date em UTC.
   *
   * new Date('2026-09-10') é lido como meia-noite em UTC e, no Brasil, exibido
   * como o dia 9 — o mesmo tropeço que já fazia a data da venda andar para
   * trás. Trabalhando sempre em UTC, o dia nunca escorrega.
   */
  private isoParaData(iso: string): Date {
    const [ano, mes, dia] = iso.split('-').map(Number);
    return new Date(Date.UTC(ano, mes - 1, dia));
  }

  private dataParaIso(data: Date): string {
    return data.toISOString().slice(0, 10);
  }

  private somarDias(data: Date, dias: number): Date {
    const nova = new Date(data.getTime());
    nova.setUTCDate(nova.getUTCDate() + dias);
    return nova;
  }

  // segunda-feira da semana daquela data (getUTCDay: 0 é domingo)
  private segundaDa(data: Date): Date {
    const diaDaSemana = data.getUTCDay();
    return this.somarDias(data, -((diaDaSemana + 6) % 7));
  }

  private montarCalendario(servicos: ServicoCrm[]): void {
    const hojeIso = this.formatar.hojeISO();
    const inicio = this.somarDias(
      this.segundaDa(this.isoParaData(hojeIso)),
      -7 * this.semanasAntes,
    );

    const total = this.semanasAntes + SEMANAS_ADIANTE;
    const semanas: SemanaCalendario[] = [];
    let mesAnterior = -1;

    for (let s = 0; s < total; s++) {
      const segunda = this.somarDias(inicio, s * 7);
      const dias: DiaCalendario[] = [];

      for (let d = 0; d < 7; d++) {
        const data = this.somarDias(segunda, d);
        const iso = this.dataParaIso(data);

        dias.push({
          iso,
          numero: data.getUTCDate(),
          diaSemana: DIAS_SEMANA[d],
          hoje: iso === hojeIso,
          servicos: servicos.filter((servico) => this.aconteceEm(servico, iso)),
        });
      }

      // o cabeçalho do mês sai na primeira semana que começa nele
      const mes = segunda.getUTCMonth();
      const novoMes = mes !== mesAnterior;
      mesAnterior = mes;

      semanas.push({
        dias,
        contemHoje: dias.some((dia) => dia.hoje),
        rotuloMes: novoMes ? `${MESES[mes]} de ${segunda.getUTCFullYear()}` : null,
      });
    }

    this.semanas = semanas;
  }

  // o serviço ocupa todos os dias entre início e fim; sem fim, ocupa só o início
  private aconteceEm(servico: ServicoCrm, iso: string): boolean {
    if (!servico.dataInicio) {
      return false;
    }

    const fim = servico.dataFim || servico.dataInicio;

    // datas em aaaa-mm-dd comparam certo como texto
    return iso >= servico.dataInicio && iso <= fim;
  }

  // clicar num dia vazio já abre o formulário com a data preenchida
  novoNoDia(iso: string): void {
    this.editando = {
      id: 0,
      bananal: '',
      servico: '',
      responsavel: '',
      dataInicio: iso,
      dataFim: iso,
      descricao: '',
      etapa: 'Planejado',
    };
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
