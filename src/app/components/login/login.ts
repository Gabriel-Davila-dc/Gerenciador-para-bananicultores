import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  login() {
    this.error = '';

    this.http
      .post<any>('http://localhost:3333/login', {
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          // salva ID do usuário (jeito frágil)
          localStorage.setItem('userId', response.id);

          // opcional: salvar nome
          localStorage.setItem('userName', response.name);

          // redireciona
          this.router.navigate(['/home']);
        },
        error: () => {
          this.error = 'Email ou senha inválidos';
        },
      });
  }
}
