import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ServicoCrm } from '../models/servico-crm';

/**
 * Conversa com /servicos. Deixa o erro subir de propósito: quem chama é a
 * fila de sincronização, que precisa saber se falhou para tentar de novo.
 */
@Injectable({
  providedIn: 'root',
})
export class ServicosApi {
  private apiUrl = `${environment.apiUrl}/servicos`;

  constructor(private http: HttpClient) {}

  async listar(): Promise<ServicoCrm[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ servicos: ServicoCrm[] }>(this.apiUrl),
    );

    return resposta.servicos.map((servico) => this.normalizar(servico));
  }

  async criar(servico: ServicoCrm): Promise<number> {
    const resposta = await firstValueFrom(
      this.http.post<{ servico: ServicoCrm }>(this.apiUrl, servico),
    );

    return resposta.servico.id;
  }

  async editar(servico: ServicoCrm): Promise<void> {
    await firstValueFrom(this.http.put(`${this.apiUrl}/${servico.id}`, servico));
  }

  async apagar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }

  // o banco devolve null onde o formulário usa string vazia
  private normalizar(servico: ServicoCrm): ServicoCrm {
    return {
      ...servico,
      bananal: servico.bananal ?? '',
      servico: servico.servico ?? '',
      responsavel: servico.responsavel ?? '',
      dataInicio: servico.dataInicio ?? '',
      dataFim: servico.dataFim ?? '',
      descricao: servico.descricao ?? '',
    };
  }
}
