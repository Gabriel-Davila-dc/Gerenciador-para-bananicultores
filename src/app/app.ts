import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Header } from './components/header/header';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Calculadora de Banana';

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit(): Promise<void> {
    // Ver se o usuario permanece logado verificando o token
    const tokenValido = localStorage.getItem('token');

    if (!tokenValido) {
      this.snackBar.open(' Você não está logado!', '⚠️', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
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
            this.snackBar.open(' Você está logado!', '✅', {
              duration: 2500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
            });
          },
          error: () => {
            this.snackBar.open(' Você não está logado!', '⚠️', {
              duration: 2500,
              verticalPosition: 'top',
              horizontalPosition: 'right',
            });
          },
        });
    }
  }
}
