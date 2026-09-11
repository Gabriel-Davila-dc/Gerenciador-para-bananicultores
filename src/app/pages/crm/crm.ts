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
import { Seletor } from '../../components/seletor/seletor';
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
  // "8 a 14 de setembro": cabeçalho de cada semana na agenda do celular, onde
  // não existe grade de 7 colunas dizendo sozinha onde a semana termina
  rotuloSemana: string;
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
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule, DragDropModule, Seletor],
  templateUrl: './crm.html',
  styleUrl: './crm.css',
})
export class Crm {
  colunas: Coluna[] = [];
  // a lista da etapa no formulário sai daqui, não das colunas do quadro:
  // o seletor quer os nomes, não os baldes com os serviços dentro
  protected etapas = ETAPAS_CRM;
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

  /**
   * De qual dia do calendário o formulário foi aberto.
   *
   * É o que permite "tirar só deste dia": pelo quadro não existe dia nenhum
   * em jogo, então lá fica null e o botão não aparece.
   */
  diaClicado: string | null = null;

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

  /**
   * Rótulo da semana para a agenda do celular.
   *
   * Quando a semana atravessa a virada do mês os dois meses aparecem
   * ("29 de setembro a 5 de outubro") — sem isso o cabeçalho mentiria sobre
   * metade dos dias listados embaixo dele.
   */
  private rotuloDaSemana(segunda: Date, domingo: Date): string {
    const mesInicio = MESES[segunda.getUTCMonth()].toLowerCase();
    const mesFim = MESES[domingo.getUTCMonth()].toLowerCase();

    if (mesInicio === mesFim) {
      return `${segunda.getUTCDate()} a ${domingo.getUTCDate()} de ${mesFim}`;
    }

    return `${segunda.getUTCDate()} de ${mesInicio} a ${domingo.getUTCDate()} de ${mesFim}`;
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
        rotuloSemana: this.rotuloDaSemana(segunda, this.somarDias(segunda, 6)),
      });
    }

    this.semanas = semanas;
  }

  // o serviço ocupa todos os dias entre início e fim, menos os que foram
  // tirados à mão; sem fim, ocupa só o início
  private aconteceEm(servico: ServicoCrm, iso: string): boolean {
    if (!servico.dataInicio) {
      return false;
    }

    if (servico.diasPulados?.includes(iso)) {
      return false;
    }

    const fim = servico.dataFim || servico.dataInicio;

    // datas em aaaa-mm-dd comparam certo como texto
    return iso >= servico.dataInicio && iso <= fim;
  }

  // os dias em que o serviço realmente acontece, em ordem
  private diasDoServico(servico: ServicoCrm): string[] {
    if (!servico.dataInicio) {
      return [];
    }

    const fim = servico.dataFim || servico.dataInicio;
    const dias: string[] = [];

    let data = this.isoParaData(servico.dataInicio);

    for (let iso = this.dataParaIso(data); iso <= fim; iso = this.dataParaIso(data)) {
      if (this.aconteceEm(servico, iso)) {
        dias.push(iso);
      }

      data = this.somarDias(data, 1);
    }

    return dias;
  }

  // o botão só faz sentido quando sobra dia: tirar o único dia seria apagar
  get podeTirarDoDia(): boolean {
    if (!this.editando || !this.diaClicado) {
      return false;
    }

    return this.diasDoServico(this.editando).length > 1;
  }

  get rotuloDiaClicado(): string {
    if (!this.diaClicado) {
      return "";
    }

    const [, mes, dia] = this.diaClicado.split("-");
    return `${dia}/${mes}`;
  }

  /**
   * Tira do serviço só o dia aberto, mantendo o resto do intervalo.
   *
   * Quando o dia é uma das pontas, o intervalo encolhe — guardar "pulei o
   * primeiro dia" deixaria um buraco invisível, que reapareceria torto se
   * depois se esticasse a data. Só o dia do meio vira dia pulado.
   */
  tirarDoDia(): void {
    const servico = this.editando;

    if (!servico || !this.diaClicado) {
      return;
    }

    const dias = this.diasDoServico(servico);
    const iso = this.diaClicado;

    if (dias.length <= 1 || !dias.includes(iso)) {
      return;
    }

    if (iso === dias[0]) {
      servico.dataInicio = dias[1];
    } else if (iso === dias[dias.length - 1]) {
      servico.dataFim = dias[dias.length - 2];
    } else {
      servico.diasPulados = [...servico.diasPulados, iso].sort();
    }

    // depois de encolher, o que caiu fora do intervalo virou lixo
    const fim = servico.dataFim || servico.dataInicio;
    servico.diasPulados = servico.diasPulados.filter(
      (pulado) => pulado > servico.dataInicio && pulado < fim,
    );

    this.crmService.salvar(servico);
    this.fechar();
    this.carregar();
  }

  // clicar num dia vazio já abre o formulário com a data preenchida
  novoNoDia(iso: string): void {
    // serviço novo não tem o que tirar: o botão do dia fica fora
    this.diaClicado = null;

    this.editando = {
      id: 0,
      bananal: '',
      servico: '',
      responsavel: '',
      dataInicio: iso,
      dataFim: iso,
      diasPulados: [],
      descricao: '',
      etapa: 'Planejado',
    };
  }

  novo(): void {
    const hoje = this.formatar.hojeISO();

    this.diaClicado = null;

    this.editando = {
      id: 0,
      bananal: '',
      servico: '',
      responsavel: '',
      dataInicio: hoje,
      dataFim: hoje,
      diasPulados: [],
      descricao: '',
      etapa: 'Planejado',
    };
  }

  // iso vem do calendário, onde o toque aconteceu num dia; do quadro vem vazio
  editar(servico: ServicoCrm, iso?: string): void {
    this.diaClicado = iso ?? null;

    // clone: se cancelar, o card da tela não fica alterado pela metade.
    // o array também é copiado, senão tirar um dia e cancelar já teria mexido
    // no serviço que está no cache
    this.editando = { ...servico, diasPulados: [...(servico.diasPulados ?? [])] };
  }

  salvar(): void {
    if (!this.editando) {
      return;
    }

    this.crmService.salvar(this.editando);
    this.fechar();
    this.carregar();
  }

  apagar(servico: ServicoCrm): void {
    this.crmService.apagar(servico.id);
    this.fechar();
    this.carregar();
  }

  fechar(): void {
    this.editando = null;
    this.diaClicado = null;
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
