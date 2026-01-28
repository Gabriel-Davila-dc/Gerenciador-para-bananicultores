import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VendaApi } from '../Types/VendaApi';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class VendaService {
  constructor(
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  async salvarVenda(venda: any, tokenValido: string): Promise<boolean> {
    //envia a Venda por request e o Token pelo headers
    try {
      await firstValueFrom(
        this.http.post<any>('http://localhost:3333/vendas', venda, {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        }),
      );

      this.snackBar.open(' Salvo com sucesso!', '✅', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return true;
    } catch (error: any) {
      alert(
        `Cliente: ${venda.cliente} ${error?.error?.message || 'Erro ao salvar a venda no servidor'}`,
      );
      this.snackBar.open(`Cliente: ${venda.cliente} ${error?.error?.message}`, '❌', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
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
    this.snackBar.open(`Deletado`, '❌', {
      duration: 2500,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/gerenciador']);
    });
  }

  async atualizarVenda(venda: Venda, tokenValido: string): Promise<boolean> {
    try {
      await firstValueFrom(
        this.http.put(`http://localhost:3333/vendas/${venda.id}`, venda, {
          headers: { Authorization: `Bearer ${tokenValido}` },
        }),
      );
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
