import { TestBed } from '@angular/core/testing';

import { Salvar } from './salvar';

describe('Salvar', () => {
  let service: Salvar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Salvar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
