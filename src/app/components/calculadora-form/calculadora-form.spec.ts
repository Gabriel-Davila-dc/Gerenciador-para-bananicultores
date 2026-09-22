import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculadoraForm } from './calculadora-form';
import { Venda } from '../../models/venda';

const grupoZerado = {
  tipo: '',
  pesoCaixa: 0,
  precoCaixa: 0,
  caixas: 0,
  valorTotal: 0,
  pesoTotal: 0,
  precoQuilo: 0,
};

function vendaClassificada(): Venda {
  return {
    id: 9,
    nome: 'Mercado do Zé',
    bananal: 'Pedreira',
    compradorId: 7,
    pago: true,
    data: '10/09/2026',
    tipo: 'Classificada',
    simples: { ...grupoZerado },
    boa: {
      ...grupoZerado,
      pesoCaixa: 20,
      precoCaixa: 40,
      caixas: 10,
      valorTotal: 400,
      pesoTotal: 200,
      precoQuilo: 2,
    },
    fraca: {
      ...grupoZerado,
      pesoCaixa: 20,
      precoCaixa: 25,
      caixas: 5,
      valorTotal: 125,
      pesoTotal: 100,
      precoQuilo: 1.25,
    },
    valorTotal: { valor: 525, pesos: 300, mediaQuilos: 1.75, mediaCaixas: 35 },
  };
}

function vendaSimples(): Venda {
  return {
    id: 12,
    nome: '',
    bananal: '',
    compradorId: null,
    pago: false,
    data: '10/09/2026',
    tipo: 'Simples',
    simples: {
      ...grupoZerado,
      pesoCaixa: 22,
      precoCaixa: 55,
      caixas: 10,
      valorTotal: 550,
      pesoTotal: 220,
      precoQuilo: 2.5,
    },
    boa: { ...grupoZerado },
    fraca: { ...grupoZerado },
    valorTotal: { valor: 550, pesos: 220, mediaQuilos: 2.5, mediaCaixas: 0 },
  };
}

describe('CalculadoraForm', () => {
  let component: CalculadoraForm;
  let fixture: ComponentFixture<CalculadoraForm>;

  async function montar(vendaInicial: Venda | null): Promise<void> {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [CalculadoraForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CalculadoraForm);
    component = fixture.componentInstance;
    // igual ao [vendaInicial] do template: precisa estar setado antes do
    // primeiro detectChanges, que é quando ngOnInit roda
    component.vendaInicial = vendaInicial;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await montar(null);
    expect(component).toBeTruthy();
  });

  it('reabre preenchida com os valores da venda, sem zerar ao renderizar', async () => {
    await montar(vendaClassificada());

    // o botão de filtro emite a própria escolha assim que nasce; se essa
    // emissão passasse pelo reset normal, os valores abaixo voltariam a zero
    expect(component.filtroNegocio).toBe('Classificada');
    expect(component.filtroPeso).toBe('Caixa');
    expect(component.valoresBoa).toEqual([20, 40, 10]);
    expect(component.valoresFraca).toEqual([20, 25, 5]);
    expect(component.resultadosBoa).toEqual([400, 200, 2]);
    expect(component.resultadosFraca).toEqual([125, 100, 1.25]);
    expect(component.compradorId).toBe(7);
    expect(component.bananal).toBe('Pedreira');
    expect(component.dataISO).toBe('2026-09-10');
  });

  it('mantém id e status de pago da venda ao salvar uma edição', async () => {
    await montar(vendaClassificada());

    let emitida: Venda | undefined;
    component.salva.subscribe((v) => (emitida = v));
    component.salvar();

    expect(emitida?.id).toBe(9);
    expect(emitida?.pago).toBe(true);
  });

  it('trocar para o mesmo tipo de negócio de novo (usuário clicando de novo) não teria efeito colateral', async () => {
    await montar(vendaClassificada());

    component.setFiltroNegocio('Classificada');

    expect(component.valoresBoa).toEqual([20, 40, 10]);
  });

  it('editar uma venda Simples e trocar para Classificada aproveita os dados como "Boa"', async () => {
    await montar(vendaSimples());

    component.setFiltroNegocio('Classificada');

    expect(component.valoresBoa).toEqual([22, 55, 10]);
    expect(component.valoresFraca).toEqual([0, 0, 0]);
    expect(component.resultadosBoa).toEqual([550, 220, 2.5]);
    // com a Fraca ainda zerada, o total bate com o que a venda Simples já tinha
    expect(component.resultados).toEqual([550, 220, 2.5]);
  });
});
