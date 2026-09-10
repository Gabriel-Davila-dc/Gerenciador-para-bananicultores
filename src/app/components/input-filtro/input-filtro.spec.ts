import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFiltro } from './input-filtro';

describe('InputFiltro', () => {
  let component: InputFiltro;
  let fixture: ComponentFixture<InputFiltro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [InputFiltro],
    }).compileComponents();

    fixture = TestBed.createComponent(InputFiltro);
    component = fixture.componentInstance;
    component.inputFiltro = { name: 'peso', title: 'Peso da caixa' };
    component.qualidade = 'Boa';
    component.valores = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
