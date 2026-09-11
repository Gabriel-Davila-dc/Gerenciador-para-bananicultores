import { AlertService } from './services/alert-service';
import { UserService } from './services/user-service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Salvar } from './services/salvar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Calculadora de Banana';

  constructor(
    private snackBar: MatSnackBar,
    private userService: UserService,
    private salvar: Salvar,
    private alert: AlertService,
  ) {}

  async ngOnInit(): Promise<void> {
    // Ver se o usuario permanece logado verificando o token
    const tokenValido = localStorage.getItem('token');

    //ver se usuario está conectado a internet
    const conectado: boolean = await this.userService.getUser();

    //usuario não está logado
    if (!tokenValido) {
      this.alert.message('Não está conectado', 'alert');
    } else {
      console.log('TokenValido:', tokenValido);
      //usuario conectado
      if (conectado) {
        this.alert.message('Conectado', 'sucess');
      }
      // logado, sem internet
      else {
        this.alert.message('Sem internet', 'alert');
      }
    }
  }
}
