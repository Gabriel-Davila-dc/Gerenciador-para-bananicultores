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

  // data de hoje em "aaaa-mm-dd", pronta pra jogar num input type="date".
  // montada a partir da data local: toISOString() usa UTC e, depois das 21h
  // no Brasil, já teria virado o dia seguinte.
  hojeISO(): string {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${hoje.getFullYear()}-${mes}-${dia}`;
  }

  // converte "aaaa-mm-dd" (input date) para "dd/mm/aaaa" quebrando o texto.
  // usar new Date('2026-09-14') aqui daria o dia anterior, porque essa forma
  // é lida como meia-noite em UTC e o Brasil está atrás desse horário.
  isoParaBR(iso: string): string {
    if (!iso) {
      return '';
    }

    const [ano, mes, dia] = iso.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  dataBRParaISO(dataBr: string): string {
    const [dia, mes, ano] = dataBr.split('/');
    return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  dataISOParaBR(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }
}
