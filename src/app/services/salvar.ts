import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { HttpClient } from '@angular/common/http';
import { VendaService } from './venda-service';
import { VendaApi } from '../Types/VendaApi';

@Injectable({
  providedIn: 'root',
})
export class Salvar {
  constructor(
    private http: HttpClient,
    private vendaService: VendaService,
  ) {}

  async salvarVenda(venda: Venda): Promise<void> {
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

    //  Salvar no banco de dados do servidor
    // Ver se o usuario permanece logado e conectado, verificando o token
    const tokenValido = localStorage.getItem('token');

    if (!tokenValido) {
      alert(' Faça Login em uma conta para salvar permanentemente.');
    } else {
      // Verifica se o token é válido
      this.http
        .get('http://localhost:3333/users/token', {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        })
        .subscribe({
          //conectado, pode mandar salvar
          next: async () => {
            const naoSalvas = [];

            while (0 < vendidas.length) {
              const vendaParaSalvar = vendidas.shift();

              const resultado = await this.vendaService.salvarVenda(vendaParaSalvar, tokenValido);
              //se tiver sido salvo no banco de dados, apaga do localStorage
              if (resultado == true) {
                const vendasJSON = JSON.stringify(vendidas, null, 2);

                //salva localmente
                localStorage.setItem('vendas', vendasJSON);
              } else {
                //vendas que deram erro ao salvar no servidor, esperam aqui para voltar ao localStorege
                naoSalvas.push(vendaParaSalvar);
              }
            }
            // salva em  localStorage as que não foram salvas no servidor
            const vendasJSON = JSON.stringify(naoSalvas, null, 2);
          },
          //Não conectado, deixa no localStorage
          error: () => {
            alert('Você não está logado. Conecte-se a internet para salvar permanentemente.');
          },
        });
    }
  }

  async pegarVendas(): Promise<Venda[]> {
    //Pega as vendas Salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver venda, joga no array para retorno
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    //servidor
    const vendaApi: VendaApi[] = await this.vendaService.listarVendas(
      localStorage.getItem('token') || '',
    );

    const vendasConvertidas: Venda[] = vendaApi.map((api) => this.mapVendaApiParaVenda(api));

    vendidas.push(...vendasConvertidas);

    return vendidas;
  }

  async apagarVenda(id: number): Promise<void> {
    const tokenValido = localStorage.getItem('token');
    const vendasSalvas = localStorage.getItem('vendas');
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    const vendasFiltradas = vendidas.filter((venda) => venda.id !== id);
    const vendasJSON = JSON.stringify(vendasFiltradas, null, 2);
    localStorage.setItem('vendas', vendasJSON);
    console.log(`Venda com ID ${id} foi apagada.`);

    if (!tokenValido) {
      alert(' Faça Login em uma conta para salvar permanentemente.');
    } else {
      // Verifica se o token é válido
      this.http
        .get('http://localhost:3333/users/token', {
          headers: {
            Authorization: `Bearer ${tokenValido}`,
          },
        })
        .subscribe({
          //conectado, pode mandar salvar
          next: async () => {
            await this.vendaService.apagarVenda(id, tokenValido);
          },
          error: () => {
            alert('Você não está logado. Conecte-se a internet para Apagar.');
          },
        });
    }
  }

  //pega os dados do VendaApi(JSON) e converte para Venda
  private mapVendaApiParaVenda(api: VendaApi): Venda {
    return {
      id: api.id,

      nome: api.cliente ?? 'Sem nome',
      data: api.createdAt,
      tipo: api.tipo,

      simples: {
        tipo: api.tipoSimples,
        pesoCaixa: api.simplesPeso ?? 0,
        precoCaixa: api.simplesPrecoCaixa ?? 0,
        caixas: api.simplesCaixas ?? 0,
        valorTotal: api.simplesValorTotal ?? 0,
        pesoTotal: api.simplesPesoTotal ?? 0,
        precoQuilo: api.simplesPrecoQuilo ?? 0,
      },

      boa: {
        tipo: api.tipoBoa,
        pesoCaixa: api.boaPeso ?? 0,
        precoCaixa: api.boaPrecoCaixa ?? 0,
        caixas: api.boaCaixas ?? 0,
        valorTotal: api.boaValorTotal ?? 0,
        pesoTotal: api.boaPesoTotal ?? 0,
        precoQuilo: api.boaPrecoQuilo ?? 0,
      },

      fraca: {
        tipo: api.tipoFraca,
        pesoCaixa: api.fracaPeso ?? 0,
        precoCaixa: api.fracaPrecoCaixa ?? 0,
        caixas: api.fracaCaixas ?? 0,
        valorTotal: api.fracaValorTotal ?? 0,
        pesoTotal: api.fracaPesoTotal ?? 0,
        precoQuilo: api.fracaPrecoQuilo ?? 0,
      },

      valorTotal: {
        valor: api.valorTotal ?? 0,
        pesos: api.pesosTotal ?? 0,
        mediaQuilos: api.mediaQuilo ?? 0,
        mediaCaixas: api.mediaCaixa ?? 0,
      },
    };
  }
}
