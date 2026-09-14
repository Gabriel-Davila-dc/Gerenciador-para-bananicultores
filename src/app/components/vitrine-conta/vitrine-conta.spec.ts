import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VitrineConta } from './vitrine-conta';

describe('VitrineConta', () => {
  let component: VitrineConta;
  let fixture: ComponentFixture<VitrineConta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
      imports: [VitrineConta],
    }).compileComponents();

    fixture = TestBed.createComponent(VitrineConta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
