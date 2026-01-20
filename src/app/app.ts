import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggle, MatToolbarModule, MatButtonModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Calculadora de Banana';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Ver se o usuario permanece logado verificando o token
    const tokenValido = localStorage.getItem('token');

    if (!tokenValido) {
      alert('❌ Faça login novamente.');
    } else {
      console.log('TokenValido:', tokenValido);
      this.http
        .get('http://localhost:3333/users/token', {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        })
        .subscribe({
          next: (user) => {
            console.log('Token válido, usuário logado:', user);
            alert('✅ Você está logado.');
          },
          error: () => {
            console.log('Token inválido ou expirado, limpando sessão');
            alert('❌ Você não está logado.');
            //localStorage.removeItem('token');
          },
        });
    }
  }
}
