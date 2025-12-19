import { Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';

@Component({
  standalone: true,
  selector: 'app-gerenciador',
  imports: [CardSalvo],
  templateUrl: './gerenciador.html',
  styleUrl: './gerenciador.css',
})
export class Gerenciador {}
