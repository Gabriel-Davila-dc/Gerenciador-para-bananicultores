import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert {
  icon: any = '';
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {
    if (this.data.tipo == 'sucess') {
      this.icon = '✅';
    } else if (this.data.tipo == 'alert') {
      this.icon = '⚠️';
    } else {
      this.icon = '❌';
    }
  }
}
