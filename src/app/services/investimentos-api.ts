import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Investimento } from '../models/investimento';

@Injectable({
  providedIn: 'root',
})
export class InvestimentosApi {
  private apiUrl = `${environment.apiUrl}/investimentos`;

  constructor(private http: HttpClient) {}

  async listar(): Promise<Investimento[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ investimentos: Investimento[] }>(this.apiUrl),
    );

    return resposta.investimentos.map((item) => this.normalizar(item));
  }

  async criar(investimento: Investimento): Promise<number> {
    const resposta = await firstValueFrom(
      this.http.post<{ investimento: Investimento }>(this.apiUrl, investimento),
    );

    return resposta.investimento.id;
  }

  async editar(investimento: Investimento): Promise<void> {
    await firstValueFrom(this.http.put(`${this.apiUrl}/${investimento.id}`, investimento));
  }

  async apagar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }

  private normalizar(item: Investimento): Investimento {
    return {
      ...item,
      // colunas decimais voltam do MySQL como texto ("2400.00"); sem converter,
      // as somas da tela virariam concatenação de string
      quantidade: Number(item.quantidade),
      valor: Number(item.valor),
      data: item.data ?? '',
      observacao: item.observacao ?? '',
    };
  }
}
