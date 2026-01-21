import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VendaApi } from '../Types/VendaApi';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class VendaService {
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  async salvarVenda(venda: any, tokenValido: string): Promise<boolean> {
    //envia a Venda por request e o Token pelo headers
    try {
      const resposta = await firstValueFrom(
        this.http.post<any>('http://localhost:3333/vendas', venda, {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        }),
      );

      alert(resposta.message || 'Salvo com sucesso!');
      return true;
    } catch (error: any) {
      alert(
        `Cliente: ${venda.cliente} ${error?.error?.message || 'Erro ao salvar a venda no servidor'}`,
      );
      return false;
    }
  }

  async listarVendas(tokenValido: string): Promise<VendaApi[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ vendas: VendaApi[] }>('http://localhost:3333/vendas', {
        headers: {
          Authorization: `Bearer ${tokenValido}`,
        },
      }),
    );
    return resposta.vendas;
  }

  async apagarVenda(id: number, tokenValido: string): Promise<void> {
    await firstValueFrom(
      this.http.delete(`http://localhost:3333/vendas/${id}`, {
        headers: {
          Authorization: `Bearer ${tokenValido}`,
        },
      }),
    );
    this.router.navigate(['/gerenciador']);
  }
}
