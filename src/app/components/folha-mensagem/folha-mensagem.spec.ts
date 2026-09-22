import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FolhaMensagem } from './folha-mensagem';

describe('FolhaMensagem', () => {
  let component: FolhaMensagem;
  let fixture: ComponentFixture<FolhaMensagem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [FolhaMensagem],
    }).compileComponents();

    fixture = TestBed.createComponent(FolhaMensagem);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('mostra o texto recebido dentro da folha', () => {
    component.texto = 'Nenhuma venda para esse filtro.';
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).querySelector('.folha-texto');
    expect(texto?.textContent?.trim()).toBe('Nenhuma venda para esse filtro.');
  });

  // não trava o app com uma mensagem enorme: o CSS corta com reticências,
  // então o teste só garante que o texto continua todo ali no DOM
  it('aceita mensagem longa sem quebrar', () => {
    component.texto =
      'Uma mensagem bem mais longa do que o espaço da folha realmente comporta, só para ver o que acontece quando alguém exagera no texto.';
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).querySelector('.folha-texto');
    expect(texto?.textContent?.trim()).toBe(component.texto);
  });
});
