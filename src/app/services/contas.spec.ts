import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Contas } from './contas';

describe('Contas', () => {
  let service: Contas;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],});
    service = TestBed.inject(Contas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
