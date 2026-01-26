import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVenda } from './update-venda';

describe('UpdateVenda', () => {
  let component: UpdateVenda;
  let fixture: ComponentFixture<UpdateVenda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateVenda]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateVenda);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
