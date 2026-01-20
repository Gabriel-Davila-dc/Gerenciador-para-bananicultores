import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { HttpClient } from '@angular/common/http';
import { VendaService } from './venda-service';

@Injectable({
  providedIn: 'root',
})
export class Salvar {
  constructor(
    private http: HttpClient,
    private vendaService: VendaService,
  ) {}

  salvarVenda(venda: Venda): void {
    //trás as vendas salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver vendas joga pro array de vendas "vendidas", ou cria um vazio
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    //colocas as novas vendas no array de vendas
    venda.id = vendidas.length + 1;
    vendidas.push(venda);
    //transforma o array atualizado em Json
    const vendasJSON = JSON.stringify(vendidas, null, 2);
    //salva localmente
    localStorage.setItem('vendas', vendasJSON);
    //só para eu ver no console
    console.log('Venda salva em  LocalStorege:', vendasJSON);

    //  Salvar no banco de dados do servidor
    // Ver se o usuario permanece logado e conectado, verificando o token
    const tokenValido = localStorage.getItem('token');

    if (!tokenValido) {
      alert(' Faça Login em uma conta para salvar permanentemente.');
    } else {
      // Verifica se o token é válido
      console.log('TokenValido:', tokenValido);
      this.http
        .get('http://localhost:3333/users/token', {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        })
        .subscribe({
          //conectado, pode mandar salvar
          next: () => {
            while (vendidas.length > 0) {
              const vendaParaSalvar = vendidas.shift();
              this.vendaService.salvarVenda(vendaParaSalvar, tokenValido);
              const vendasJSON = JSON.stringify(vendidas, null, 2);
              //salva localmente
              localStorage.setItem('vendas', vendasJSON);
            }
          },
          //Não conectado, deixa no localStorage
          error: () => {
            console.log('Token inválido ou expirado');
            alert('Você não está logado. Conecte-se a internet para salvar permanentemente.');
          },
        });
    }
  }

  pegarVendas(): Venda[] {
    //Pega as vendas Salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver venda, joga no array para retorno
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    return vendidas;
  }

  apagarVenda(id: number): void {
    const vendasSalvas = localStorage.getItem('vendas');
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    const vendasFiltradas = vendidas.filter((venda) => venda.id !== id);
    const vendasJSON = JSON.stringify(vendasFiltradas, null, 2);
    localStorage.setItem('vendas', vendasJSON);
    console.log(`Venda com ID ${id} foi apagada.`);
  }
}
