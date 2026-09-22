import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { FolhaMensagem } from '../folha-mensagem/folha-mensagem';

@Component({
  selector: 'app-alert',
  imports: [FolhaMensagem],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  icon: string = '';

  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    if (this.data.tipo == 'sucess') {
      this.icon = '✅';
    } else if (this.data.tipo == 'alert') {
      this.icon = '⚠️';
    } else {
      this.icon = '❌';
    }
  }

  get texto(): string {
    return `${this.icon} ${this.data.message}`;
  }
}
