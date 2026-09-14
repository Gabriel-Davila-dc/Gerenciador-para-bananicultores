import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { VitrineConta } from '../../components/vitrine-conta/vitrine-conta';

/**
 * "Esqueci minha senha" em duas etapas na mesma tela.
 *
 * 1. pede o e-mail e a API manda um código de 6 dígitos
 * 2. o código e a senha nova voltam juntos, e a API já devolve logado
 *
 * Uma tela só em vez de duas rotas porque o segundo passo acontece com o
 * aplicativo aberto ao lado do e-mail, no mesmo celular: sair da página e
 * voltar por um link perderia o e-mail já digitado.
 *
 * Esta é a única parte do app que não funciona sem sinal — sem rede não tem
 * como o servidor mandar e-mail. Por isso nada aqui entra na fila de
 * sincronização: ou vai agora, ou a pessoa tenta de novo.
 */
@Component({
  selector: 'app-esqueci-senha',
  imports: [FormsModule, CommonModule, RouterModule, VitrineConta],
  templateUrl: './esqueci-senha.html',
  styleUrls: ['../autenticacao.css', './esqueci-senha.css'],
})
export class EsqueciSenha {
  etapa: 'email' | 'codigo' = 'email';

  email = '';
  codigo = '';
  password = '';

  error = '';
  aviso = '';
  enviando = false;

  verSenha = false;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  //etapa 1: pedir o código
  pedirCodigo() {
    if (!this.email.includes('@') || !this.email.includes('.')) {
      return this.mostrarErro('E-mail inválido!');
    }

    this.error = '';
    this.enviando = true;
    this.cdr.detectChanges();

    this.userService.postEsqueciSenha(this.email).subscribe({
      next: (res) => {
        // a resposta é a mesma com e sem cadastro, então a tela sempre avança:
        // parar aqui quando o e-mail não existe contaria quais e-mails têm conta
        this.etapa = 'codigo';
        this.enviando = false;
        this.aviso = res.message;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.enviando = false;
        this.mostrarErro(err.error?.message || 'Não deu para enviar o código. Tente de novo.');
      },
    });
  }

  //etapa 2: trocar a senha usando o código
  redefinir() {
    if (!/^\d{6}$/.test(this.codigo.trim())) {
      return this.mostrarErro('O código tem 6 números.');
    }

    if (this.password.length < 6) {
      return this.mostrarErro('A senha deve ter no mínimo 6 caracteres!');
    }

    this.error = '';
    this.enviando = true;
    this.cdr.detectChanges();

    this.userService
      .postRedefinirSenha(this.email, this.codigo.trim(), this.password)
      .subscribe({
        next: () => {
          // a API já devolveu token novo, então entra direto
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });
        },
        error: (err) => {
          this.enviando = false;
          this.mostrarErro(err.error?.message || 'Não deu para trocar a senha. Tente de novo.');
        },
      });
  }

  //volta para a etapa do e-mail, para corrigir um endereço digitado errado
  trocarEmail() {
    this.etapa = 'email';
    this.codigo = '';
    this.password = '';
    this.error = '';
    this.aviso = '';
    this.cdr.detectChanges();
  }

  private mostrarErro(mensagem: string) {
    this.error = mensagem;
    this.aviso = '';
    this.cdr.detectChanges();
  }
}
