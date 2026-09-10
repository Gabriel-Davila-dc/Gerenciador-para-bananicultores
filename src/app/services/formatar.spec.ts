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
});
