import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VendaApi } from '../Types/VendaApi';
import { environment } from '../../environments/environment';

/**
 * Conversa com a API. Não trata erro nem avisa a tela de propósito:
 * quem chama é a fila de sincronização, que precisa saber se falhou
 * para manter a operação pendente e tentar de novo depois.
 */
@Injectable({
  providedIn: 'root',
})
export class VendaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // devolve o id que o servidor atribuiu à venda
  async salvarVenda(venda: Venda): Promise<number> {
    const resposta = await firstValueFrom(
      this.http.post<{ venda: VendaApi }>(`${this.apiUrl}/vendas`, venda),
    );

    return resposta.venda.id;
  }

  async listarVendas(): Promise<VendaApi[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ vendas: VendaApi[] }>(`${this.apiUrl}/vendas`),
    );
    return resposta.vendas;
  }

  async apagarVenda(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/vendas/${id}`));
  }

  async atualizarVenda(venda: Venda): Promise<void> {
    await firstValueFrom(this.http.put(`${this.apiUrl}/vendas/${venda.id}`, venda));
  }
}
