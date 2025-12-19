import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Calculadora } from './pages/calculadora/calculadora';
import { Header } from './components/header/header';
import { Gerenciador } from './pages/gerenciador/gerenciador';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggle, MatToolbarModule, MatButtonModule, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'Calculadora de Banana';
}
