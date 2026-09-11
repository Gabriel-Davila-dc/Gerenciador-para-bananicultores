import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Crm } from './crm';
import { ServicoCrm } from '../../models/servico-crm';
import { CrmService } from '../../services/crm-service';

// segunda a sexta da mesma semana, o caso que motivou os dias pulados
const SEGUNDA = '2026-09-07';
const TERCA = '2026-09-08';
const QUARTA = '2026-09-09';
const QUINTA = '2026-09-10';
const SEXTA = '2026-09-11';

const DESFOLHA: ServicoCrm = {
  id: 7,
  bananal: 'Talhão do Córrego',
  servico: 'Desfolha',
  responsavel: 'Equipe própria',
  dataInicio: SEGUNDA,
  dataFim: SEXTA,
  diasPulados: [],
  descricao: '',
  etapa: 'Fazendo',
};

describe('Crm — tirar um dia do serviço', () => {
  let component: Crm;
  let fixture: ComponentFixture<Crm>;
  let crmService: CrmService;

  // o serviço salvo no cache, que é de onde a tela lê
  const salvo = (): ServicoCrm => crmService.listar().find((s) => s.id === DESFOLHA.id)!;

  beforeEach(async () => {
    localStorage.clear();
    // semeado antes de criar o componente: sem isso o service planta os exemplos
    localStorage.setItem('servicos-crm', JSON.stringify([DESFOLHA]));

    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [Crm],
    }).compileComponents();

    fixture = TestBed.createComponent(Crm);
    component = fixture.componentInstance;
    crmService = TestBed.inject(CrmService);
  });

  afterEach(() => localStorage.clear());

  it('tira o dia do meio sem mexer nas pontas', () => {
    component.editar(DESFOLHA, QUARTA);
    component.tirarDoDia();

    expect(salvo().dataInicio).toBe(SEGUNDA);
    expect(salvo().dataFim).toBe(SEXTA);
    expect(salvo().diasPulados).toEqual([QUARTA]);
  });

  it('some do dia tirado e continua nos outros', () => {
    component.editar(DESFOLHA, QUARTA);
    component.tirarDoDia();

    const aconteceEm = (iso: string) =>
      (component as unknown as { aconteceEm(s: ServicoCrm, iso: string): boolean }).aconteceEm(
        salvo(),
        iso,
      );

    expect(aconteceEm(QUARTA)).toBeFalse();
    expect(aconteceEm(TERCA)).toBeTrue();
    expect(aconteceEm(QUINTA)).toBeTrue();
  });

  // encolher a ponta em vez de pular: um buraco na borda seria invisível e
  // reapareceria torto se a data fosse esticada depois
  it('encolhe o início quando o dia tirado é o primeiro', () => {
    component.editar(DESFOLHA, SEGUNDA);
    component.tirarDoDia();

    expect(salvo().dataInicio).toBe(TERCA);
    expect(salvo().dataFim).toBe(SEXTA);
    expect(salvo().diasPulados).toEqual([]);
  });

  it('encolhe o fim quando o dia tirado é o último', () => {
    component.editar(DESFOLHA, SEXTA);
    component.tirarDoDia();

    expect(salvo().dataInicio).toBe(SEGUNDA);
    expect(salvo().dataFim).toBe(QUINTA);
    expect(salvo().diasPulados).toEqual([]);
  });

  it('tirar a ponta ao lado de um dia já pulado pula o buraco e não deixa lixo', () => {
    component.editar(DESFOLHA, TERCA);
    component.tirarDoDia();

    // agora segunda é a ponta e terça está pulada: tirar a segunda precisa
    // levar o início para a quarta, não para a terça que já não existe
    component.editar(salvo(), SEGUNDA);
    component.tirarDoDia();

    expect(salvo().dataInicio).toBe(QUARTA);
    expect(salvo().diasPulados).toEqual([]);
  });

  it('não oferece tirar o dia quando o serviço é de um dia só', () => {
    component.editar({ ...DESFOLHA, dataInicio: QUARTA, dataFim: QUARTA }, QUARTA);

    expect(component.podeTirarDoDia).toBeFalse();
  });

  it('não oferece tirar o dia quando o formulário veio do quadro', () => {
    component.editar(DESFOLHA);

    expect(component.diaClicado).toBeNull();
    expect(component.podeTirarDoDia).toBeFalse();
  });

  it('cancelar depois de mexer não altera o serviço guardado', () => {
    component.editar(DESFOLHA, QUARTA);
    component.editando!.diasPulados.push(QUINTA);
    component.fechar();

    expect(salvo().diasPulados).toEqual([]);
  });
});
