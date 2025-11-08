import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFiltro } from './input-filtro';

describe('InputFiltro', () => {
  let component: InputFiltro;
  let fixture: ComponentFixture<InputFiltro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFiltro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputFiltro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
