import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VendaApi } from '../Types/VendaApi';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class VendaService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  async salvarVenda(venda: Venda): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post<Venda>(`${this.apiUrl}/vendas`, venda));

      this.snackBar.open(' Salvo com sucesso!', '✅', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return true;
    } catch (error: any) {
      this.snackBar.open(`Cliente: ${venda.nome} ${error?.error?.message || 'Erro ao salvar a venda no servidor'}`, '❌', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return false;
    }
  }

  async listarVendas(): Promise<VendaApi[]> {
    const resposta = await firstValueFrom(
      this.http.get<{ vendas: VendaApi[] }>(`${this.apiUrl}/vendas`),
    );
    return resposta.vendas;
  }

  async apagarVenda(id: number): Promise<void> {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/vendas/${id}`));
    this.snackBar.open(`Deletado`, '❌', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/gerenciador/historico']);
    });
  }

  async atualizarVenda(venda: Venda): Promise<boolean> {
    try {
      await firstValueFrom(this.http.put(`${this.apiUrl}/vendas/${venda.id}`, venda));
      this.snackBar.open(' Editado com sucesso!', '✅', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return true;
    } catch (error) {
      this.snackBar.open(`Não foi possivel alterar, no momento`, '❌', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return false;
    }
  }
}
