import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Formatar } from './formatar';

describe('Formatar', () => {
  let service: Formatar;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],});
    service = TestBed.inject(Formatar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('data()', () => {
    it('mantém o que já está em dd/MM/yyyy', () => {
      expect(service.data('10/09/2026')).toBe('10/09/2026');
    });

    /**
     * Regressão real: a venda é gravada à meia-noite e a tela mostrava o dia
     * anterior, porque new Date().toLocaleDateString() converte o instante
     * para o fuso do aparelho. Como a tela reenvia essa data na edição
     * seguinte, ela andava um dia para trás a cada vez que era salva.
     */
    it('não perde um dia ao converter data em ISO', () => {
      expect(service.data('2026-09-10T00:00:00.000+00:00')).toBe('10/09/2026');
      expect(service.data('2026-01-01T00:00:00.000+00:00')).toBe('01/01/2026');
    });

    it('salvar e reexibir várias vezes não muda a data', () => {
      let atual = service.data('2026-09-10T00:00:00.000+00:00');

      for (let i = 0; i < 5; i++) {
        const [dia, mes, ano] = atual.split('/');
        atual = service.data(`${ano}-${mes}-${dia}T00:00:00.000+00:00`);
      }

      expect(atual).toBe('10/09/2026');
    });

    it('devolve vazio quando não tem data', () => {
      expect(service.data('')).toBe('');
    });
  });
});
