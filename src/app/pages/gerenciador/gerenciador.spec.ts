import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Gerenciador } from './gerenciador';

describe('Gerenciador', () => {
  let component: Gerenciador;
  let fixture: ComponentFixture<Gerenciador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gerenciador]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Gerenciador);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
