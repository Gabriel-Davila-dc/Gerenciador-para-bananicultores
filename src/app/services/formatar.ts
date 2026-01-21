import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Formatar {
  dinheiro(valor: number): string {
    if (valor === null || isNaN(valor)) {
      return '0,00';
    }

    const formatado = valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatado;
  }

  data(data: string): string {
    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');
    console.log(dataFormatada);
    // 21/01/2026
    return dataFormatada;
  }
}
