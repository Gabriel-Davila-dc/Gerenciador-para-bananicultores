import { TestBed } from '@angular/core/testing';

import { Contas } from './contas';

describe('Contas', () => {
  let service: Contas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Contas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
