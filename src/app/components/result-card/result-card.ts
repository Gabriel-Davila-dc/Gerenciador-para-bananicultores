import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Formatar } from '../../services/formatar';

@Component({
  selector: 'app-result-card',
  imports: [CommonModule],
  templateUrl: './result-card.html',
  styleUrl: './result-card.css',
})
export class ResultCard {
  @Input() tipo: string = '';
  @Input() preco: number = 0;
  @Input() peso: number = 0;
  @Input() quantidade: number = 0;
  @Input() valorfinal: number = 0;
  @Input() pesofinal: number = 0;
  @Input() quilo: number = 0;
  classe = 'container';
  formatar = new Formatar();

  ngOnInit() {
    console.log('Tipo recebido no ResultCard:', this.tipo);
    const formatar = new Formatar();

    if (this.tipo === 'boa') {
      this.classe = 'container-boa';
    } else if (this.tipo === 'fraca') {
      this.classe = 'container-fraca';
    } else {
      this.classe = 'container';
    }
  }
}
