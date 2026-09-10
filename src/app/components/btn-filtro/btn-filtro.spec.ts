import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BtnFiltro } from './btn-filtro';

describe('BtnFiltro', () => {
  let component: BtnFiltro;
  let fixture: ComponentFixture<BtnFiltro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [BtnFiltro]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BtnFiltro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
