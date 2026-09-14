import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { EsqueciSenha } from './esqueci-senha';
import { UserService } from '../../services/user-service';

/**
 * A tela do "esqueci minha senha" tem uma regra que é fácil desfazer sem
 * perceber: ela avança para o campo do código **mesmo quando o e-mail não tem
 * cadastro**.
 *
 * Parece um erro de lógica e a tentação é "consertar" mostrando "e-mail não
 * encontrado" — e aí a tela passa a dizer, para qualquer um, quais e-mails têm
 * conta. A API foi feita para responder igual nos dois casos justamente para
 * isso; a tela não pode desfazer do lado de cá.
 */
describe('EsqueciSenha', () => {
  let component: EsqueciSenha;
  let fixture: ComponentFixture<EsqueciSenha>;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideRouter([])],
      imports: [EsqueciSenha],
    }).compileComponents();

    fixture = TestBed.createComponent(EsqueciSenha);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    // ao acertar o código a tela navega e recarrega a página, para o app subir
    // de novo já com o token — dentro do Karma esse reload derruba a suíte
    // inteira, então a navegação fica pendurada e o reload nunca acontece
    spyOn(router, 'navigate').and.returnValue(new Promise<boolean>(() => {}));
    fixture.detectChanges();
  });

  it('começa pedindo o e-mail', () => {
    expect(component.etapa).toBe('email');
  });

  it('avança para o código quando a API responde', () => {
    spyOn(userService, 'postEsqueciSenha').and.returnValue(of({ message: 'Se esse e-mail...' }));

    component.email = 'produtor@exemplo.test';
    component.pedirCodigo();

    expect(component.etapa).toBe('codigo');
    expect(component.error).toBe('');
  });

  it('avança igual quando o e-mail não tem cadastro', () => {
    // a API devolve 200 com a mesma mensagem nos dois casos: parar aqui seria
    // a tela entregando o que a API se recusa a entregar
    spyOn(userService, 'postEsqueciSenha').and.returnValue(of({ message: 'Se esse e-mail...' }));

    component.email = 'ninguem@exemplo.test';
    component.pedirCodigo();

    expect(component.etapa).toBe('codigo');
  });

  it('e-mail sem arroba nem chega a chamar a API', () => {
    const chamada = spyOn(userService, 'postEsqueciSenha');

    component.email = 'produtor';
    component.pedirCodigo();

    expect(chamada).not.toHaveBeenCalled();
    expect(component.etapa).toBe('email');
    expect(component.error).toBeTruthy();
  });

  it('volta para o e-mail sem deixar rastro do código digitado', () => {
    spyOn(userService, 'postEsqueciSenha').and.returnValue(of({ message: 'ok' }));

    component.email = 'produtor@exemplo.test';
    component.pedirCodigo();
    component.codigo = '123456';
    component.password = 'senha-secreta';

    component.trocarEmail();

    expect(component.etapa).toBe('email');
    expect(component.codigo).toBe('');
    expect(component.password).toBe('');
  });

  describe('etapa do código', () => {
    beforeEach(() => {
      component.etapa = 'codigo';
      component.email = 'produtor@exemplo.test';
    });

    it('código com menos de 6 números não vai para a API', () => {
      const chamada = spyOn(userService, 'postRedefinirSenha');

      component.codigo = '123';
      component.password = 'senha-nova-123';
      component.redefinir();

      expect(chamada).not.toHaveBeenCalled();
      expect(component.error).toBeTruthy();
    });

    it('senha curta não vai para a API', () => {
      const chamada = spyOn(userService, 'postRedefinirSenha');

      component.codigo = '123456';
      component.password = '123';
      component.redefinir();

      expect(chamada).not.toHaveBeenCalled();
      expect(component.error).toBeTruthy();
    });

    it('manda o código sem os espaços que a colagem traz junto', () => {
      const chamada = spyOn(userService, 'postRedefinirSenha').and.returnValue(
        of({ id: 1, token: 'token-novo', email: 'produtor@exemplo.test' }),
      );

      component.codigo = ' 123456 ';
      component.password = 'senha-nova-123';
      component.redefinir();

      expect(chamada).toHaveBeenCalledWith('produtor@exemplo.test', '123456', 'senha-nova-123');
    });

    it('código recusado pela API vira mensagem na tela, sem sair da etapa', () => {
      spyOn(userService, 'postRedefinirSenha').and.returnValue(
        throwError(() => ({ error: { message: 'Código inválido ou vencido. Peça um novo.' } })),
      );

      component.codigo = '000000';
      component.password = 'senha-nova-123';
      component.redefinir();

      expect(component.etapa).toBe('codigo');
      expect(component.error).toBe('Código inválido ou vencido. Peça um novo.');
      expect(component.enviando).toBeFalse();
    });
  });
});
