import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Comprador } from '../models/comprador';

@Injectable({
  providedIn: 'root',
})
export class CompradoresApi {
  private apiUrl = `${environment.apiUrl}/compradores`;

  constructor(private http: HttpClient) {}

  async listar(): Promise<Comprador[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ compradores: Comprador[] }>(this.apiUrl),
    );

    return resposta.compradores.map((comprador) => this.normalizar(comprador));
  }

  async criar(comprador: Comprador): Promise<number> {
    const resposta = await firstValueFrom(
      this.http.post<{ comprador: Comprador }>(this.apiUrl, this.paraApi(comprador)),
    );

    return resposta.comprador.id;
  }

  async editar(comprador: Comprador): Promise<void> {
    await firstValueFrom(
      this.http.put(`${this.apiUrl}/${comprador.id}`, this.paraApi(comprador)),
    );
  }

  async apagar(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
  }

  // campo vazio é omitido: o validador aceita ausente, mas não string vazia
  private paraApi(comprador: Comprador) {
    return {
      nome: comprador.nome,
      ...(comprador.telefone ? { telefone: comprador.telefone } : {}),
      ...(comprador.foto ? { foto: comprador.foto } : {}),
    };
  }

  private normalizar(comprador: Comprador): Comprador {
    return {
      ...comprador,
      telefone: comprador.telefone ?? '',
      foto: comprador.foto ?? '',
    };
  }
}
