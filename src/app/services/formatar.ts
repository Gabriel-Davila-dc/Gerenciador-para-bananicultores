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
    //se já estiver formatada para br
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      return data;
    }

    const dataFormatada = new Date(data).toLocaleDateString('pt-BR');

    // 21/01/2026
    return dataFormatada;
  }

  dataBRParaISO(dataBr: string): string {
    const [dia, mes, ano] = dataBr.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }
}
