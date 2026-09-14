import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Conta } from './conta';
import { UserService } from '../../services/user-service';

/**
 * Entrar e criar conta viraram uma tela só para o painel poder deslizar de um
 * lado do bananal para o outro. Duas coisas se quebram sem barulho nesse
 * arranjo, e é o que está coberto aqui:
 *
 * - o modo com que a tela abre vem da rota (/login e /register continuam
 *   sendo endereços de verdade, espalhados em links pelo app);
 * - trocar de modo pelo botão **não** pode navegar, senão o Angular remonta a
 *   tela e a animação nem começa — só o endereço é reescrito.
 */
describe('Conta', () => {
  let fixture: ComponentFixture<Conta>;
  let component: Conta;
  let userService: UserService;

  function montar(modo: 'entrar' | 'criar') {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { data: { modo } } } },
      ],
      imports: [Conta],
    });

    fixture = TestBed.createComponent(Conta);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    fixture.detectChanges();
  }

  it('abre no modo da rota', () => {
    montar('entrar');
    expect(component.modo).toBe('entrar');

    montar('criar');
    expect(component.modo).toBe('criar');
  });

  it('trocar de modo reescreve o endereço, sem navegar', () => {
    montar('entrar');
    const local = TestBed.inject(Location);
    const navegou = spyOn(TestBed.inject(Router), 'navigate');
    const reescreveu = spyOn(local, 'replaceState');

    component.trocarModo('criar');

    expect(component.modo).toBe('criar');
    expect(reescreveu).toHaveBeenCalledWith('/register');
    expect(navegou).not.toHaveBeenCalled();
  });

  it('a senha não atravessa a troca de modo', () => {
    montar('entrar');
    component.password = 'senha-secreta';

    component.trocarModo('criar');

    expect(component.password).toBe('');
  });

  it('e-mail sem arroba nem chega a chamar a API', () => {
    montar('entrar');
    const chamada = spyOn(userService, 'getUserLogin');

    component.email = 'produtor';
    component.password = 'senha-boa';
    component.enviar();

    expect(chamada).not.toHaveBeenCalled();
    expect(component.error).toBeTruthy();
  });

  it('conta criada volta para o modo de entrar, com o e-mail já preenchido', () => {
    montar('criar');
    spyOn(userService, 'postUserRegister').and.returnValue(
      of({ id: 1, email: 'produtor@exemplo.test' }) as any,
    );

    component.email = 'produtor@exemplo.test';
    component.password = 'senha-boa';
    component.enviar();

    expect(component.modo).toBe('entrar');
    expect(component.email).toBe('produtor@exemplo.test');
  });

  it('erro da API vira mensagem na tela e destrava o botão', () => {
    montar('entrar');
    spyOn(userService, 'getUserLogin').and.returnValue(
      throwError(() => ({ error: { message: 'Senha errada' } })),
    );

    component.email = 'produtor@exemplo.test';
    component.password = 'senha-errada';
    component.enviar();

    expect(component.error).toBe('Senha errada');
    expect(component.ocupado).toBeFalse();
  });
});
