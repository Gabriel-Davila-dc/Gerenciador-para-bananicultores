import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user-service';
import { AlertService } from '../../services/alert-service';
import { VitrineConta } from '../../components/vitrine-conta/vitrine-conta';

export type ModoConta = 'entrar' | 'criar';

/**
 * Entrar e criar conta na mesma tela.
 *
 * Eram duas telas iguais em tudo menos no botão. Juntas, a troca entre elas é
 * o painel deslizando de um lado do bananal para o outro — com duas rotas o
 * Angular destrói uma tela e monta a outra, e não há o que animar.
 *
 * As duas URLs continuam de pé (/login e /register, que estão em links pelo
 * app afora): cada rota entra com o seu modo em `data`. Trocar de modo pelo
 * botão não navega — só reescreve o endereço com o Location, senão a
 * navegação remontaria a tela e cortaria a animação no meio.
 */
@Component({
  selector: 'app-conta',
  imports: [FormsModule, CommonModule, RouterModule, VitrineConta],
  templateUrl: './conta.html',
  styleUrls: ['../autenticacao.css', './conta.css'],
})
export class Conta {
  modo: ModoConta = 'entrar';

  email = '';
  password = '';
  error = '';

  // a senha escondida é o padrão, mas no celular, no sol, digitar às cegas erra
  verSenha = false;
  ocupado = false;

  constructor(
    private userService: UserService,
    private alerta: AlertService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private rota: ActivatedRoute,
    private location: Location,
  ) {
    this.modo = this.rota.snapshot.data['modo'] === 'criar' ? 'criar' : 'entrar';
  }

  trocarModo(modo: ModoConta) {
    if (this.modo === modo || this.ocupado) {
      return;
    }

    this.modo = modo;
    this.error = '';
    this.password = '';
    this.verSenha = false;
    this.location.replaceState(modo === 'criar' ? '/register' : '/login');
    this.cdr.detectChanges();
  }

  enviar() {
    if (this.modo === 'criar') {
      this.criarConta();
    } else {
      this.logar();
    }
  }

  private logar() {
    if (!this.validar()) {
      return;
    }

    this.userService.getUserLogin(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        localStorage.removeItem('token'); // limpa token antigo
        localStorage.removeItem('email'); // limpa e-mail antigo
        this.mostrarErro(err.error?.message || 'Erro ao fazer Login');
      },
    });
  }

  private criarConta() {
    if (!this.validar()) {
      return;
    }

    this.userService.postUserRegister(this.email, this.password).subscribe({
      next: () => {
        this.ocupado = false;
        // volta para o modo de entrar com o e-mail já preenchido, em vez de
        // navegar: assim a pessoa vê o painel deslizar e só falta a senha
        this.trocarModo('entrar');
        this.alerta.message('Conta criada! Agora é só entrar.', 'sucess');
      },
      error: (err) => {
        this.mostrarErro(err.error?.message || 'Erro ao criar sua conta!');
      },
    });
  }

  private validar(): boolean {
    const erro = this.verificarCredenciais(this.email, this.password);

    if (erro) {
      this.mostrarErro(erro);
      return false;
    }

    this.error = '';
    this.ocupado = true;
    this.cdr.detectChanges();
    return true;
  }

  verificarCredenciais(email: string, senha: string): string | null {
    if (!email || !senha) {
      return 'Preencha e-mail e senha!';
    }

    if (!email.includes('@') || !email.includes('.')) {
      return 'E-mail inválido!';
    }

    if (senha.length < 6) {
      return 'A senha deve ter no mínimo 6 caracteres!';
    }

    return null; // tudo ok
  }

  private mostrarErro(mensagem: string) {
    this.ocupado = false;
    this.error = mensagem;
    this.cdr.detectChanges();
  }
}
