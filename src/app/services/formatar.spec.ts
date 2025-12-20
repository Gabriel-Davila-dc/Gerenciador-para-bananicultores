import { TestBed } from '@angular/core/testing';

import { Formatar } from './formatar';

describe('Formatar', () => {
  let service: Formatar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Formatar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
