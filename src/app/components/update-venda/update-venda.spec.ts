import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVenda } from './update-venda';
import { Venda } from '../../models/venda';

const grupo = {
  tipo: '',
  pesoCaixa: 0,
  precoCaixa: 0,
  caixas: 0,
  valorTotal: 0,
  pesoTotal: 0,
  precoQuilo: 0,
};

const venda: Venda = {
  id: 1,
  nome: 'Comprador',
  bananal: 'Pedreira',
  compradorId: null,
  pago: false,
  data: '10/09/2026',
  tipo: 'Simples',
  simples: { ...grupo, valorTotal: 400, pesoTotal: 200 },
  boa: { ...grupo },
  fraca: { ...grupo },
  valorTotal: { valor: 400, pesos: 200, mediaQuilos: 2, mediaCaixas: 40 },
};

describe('UpdateVenda', () => {
  let component: UpdateVenda;
  let fixture: ComponentFixture<UpdateVenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [UpdateVenda],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdateVenda);
    component = fixture.componentInstance;
    // venda é obrigatória: o formulário é montado a partir dela
    component.venda = venda;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
