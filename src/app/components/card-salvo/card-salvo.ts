import { Venda } from '../../models/venda';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-card-salvo',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './card-salvo.html',
  styleUrl: './card-salvo.css',
})
export class CardSalvo {
  venda!: Venda;
}
