import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class VendaService {
  constructor(private http: HttpClient) {}

  async salvarVenda(venda: any, tokenValido: string): Promise<void> {
    //envia a Venda por request e o Token pelo headers
    let dados = this.http
      .post<any>('http://localhost:3333/vendas', venda, {
        headers: {
          Authorization: `Bearer ${tokenValido}`,
        },
      })
      .subscribe({
        //se der tudo certo no back-end
        next: (user) => {
          alert(user.message);
        },
        //se der errado no back-end
        error: (user) => {
          alert(user.error.message || 'Erro ao salvar a venda no servidor');
        },
      });
  }
}
