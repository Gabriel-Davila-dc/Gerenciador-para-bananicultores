import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardSalvo } from './card-salvo';

describe('CardSalvo', () => {
  let component: CardSalvo;
  let fixture: ComponentFixture<CardSalvo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardSalvo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardSalvo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
