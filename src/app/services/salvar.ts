import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';
import { VendaService } from './venda-service';
import { VendaApi } from '../Types/VendaApi';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from './user-service';
import { Formatar } from './formatar';

@Injectable({
  providedIn: 'root',
})
export class Salvar {
  // lê sempre o valor atual do localStorage, em vez de guardar em cache
  // (o cache ficava desatualizado quando o login acontecia depois da service já criada)
  private get token(): string {
    return localStorage.getItem('token') || '';
  }

  constructor(
    private vendaService: VendaService,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private formatar: Formatar,
  ) {}

  async salvarVenda(venda: Venda): Promise<void> {
    //trás as vendas salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver vendas joga pro array de vendas "vendidas", ou cria um vazio
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    //id negativo: nunca colide com o id (positivo, autoincremento) que o servidor atribui
    venda.id = -Date.now();
    vendidas.push(venda);
    //transforma o array atualizado em Json
    const vendasJSON = JSON.stringify(vendidas, null, 2);
    //salva localmente
    localStorage.setItem('vendas', vendasJSON);

    //  Salvar no banco de dados do servidor
    // Ver se o usuario permanece logado e conectado, verificando o token
    if (!this.token) {
      this.snackBar.open(' Faça Login em uma conta para salvar permanentemente.', '⚠️', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'right',
      });
      return;
    }

    // Verifica se o token é válido
    const conectado = await this.userService.getUser();
    //conectado, pode mandar salvar
    if (conectado) {
      this.rotinaSalvarVendas();
    } else {
      //Não conectado, deixa no localStorage
      this.snackBar.open(
        ' Você não está logado. Conecte-se a internet para salvar permanentemente.',
        '⚠️',
        {
          duration: 2500,
          verticalPosition: 'top',
          horizontalPosition: 'right',
        },
      );
    }
  }

  async rotinaSalvarVendas(): Promise<void> {
    const naoSalvas = [];
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver vendas joga pro array de vendas "vendidas", ou cria um vazio
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    //se tiver vendas offline, salva
    while (0 < vendidas.length) {
      const vendaParaSalvar = vendidas.shift();
      if (!vendaParaSalvar) break;

      const resultado = await this.vendaService.salvarVenda(vendaParaSalvar);
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
  }

  async pegarVendas(): Promise<Venda[]> {
    //Pega as vendas Salvas
    const vendasSalvas = localStorage.getItem('vendas');
    //se tiver venda, joga no array para retorno
    const vendidas: Venda[] = vendasSalvas ? JSON.parse(vendasSalvas) : [];
    try {
      //servidor online
      const vendaApi: VendaApi[] = await this.vendaService.listarVendas();

      const vendasConvertidas: Venda[] = vendaApi.map((api) => this.mapVendaApiParaVenda(api));

      vendidas.push(...vendasConvertidas);
    } catch (error) {
      //OffLine
      this.snackBar.open('Conecte-se para sincronizar mais vendas.', '🔓', {
        duration: 3000,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
      return vendidas.reverse();
    }

    return vendidas;
  }

  async apagarVenda(id: number): Promise<void> {
    const vendasStorage = localStorage.getItem('vendas');
    const vendidas: Venda[] = vendasStorage ? JSON.parse(vendasStorage) : [];
    //Remove a venda do localStorage, e mantem as outras salvas
    const vendasSalvas = vendidas.filter((venda) => venda.id !== id);
    const vendasJSON = JSON.stringify(vendasSalvas, null, 2);
    //salva localStorage atualizado
    localStorage.setItem('vendas', vendasJSON);
    console.log(`Venda com ID ${id} foi apagada.`);

    if (!this.token) {
      this.snackBar.open('Conecte-se para apagar permanentemente.', '🔓', {
        duration: 2500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
      });
    } else {
      // Verifica se o token é válido
      const logado = await this.userService.getUser();
      //conectado, pode mandar salvar
      if (logado) {
        await this.vendaService.apagarVenda(id);
      } else {
        this.snackBar.open('Você não está logado. Conecte-se a internet para apagar.', '🚫', {
          duration: 2500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
        });
      }
    }
  }

  async atualizarVenda(vendaAtualizada: Venda): Promise<void> {
    const salvoServer = await this.vendaService.atualizarVenda(vendaAtualizada);
    //se não salvou no server, salva no localStorage
    if (!salvoServer) {
      const vendasStorage = localStorage.getItem('vendas');
      const vendidas: Venda[] = vendasStorage ? JSON.parse(vendasStorage) : [];

      const index = vendidas.findIndex((venda) => venda.id === vendaAtualizada.id);
      if (index !== -1) {
        vendidas[index] = vendaAtualizada;
        localStorage.setItem('vendas', JSON.stringify(vendidas));
      }
    }
  }

  //pega os dados do VendaApi(JSON) e converte para Venda
  private mapVendaApiParaVenda(api: VendaApi): Venda {
    return {
      id: api.id,

      nome: api.cliente ?? 'Sem nome',
      bananal: api.bananal ?? '',
      data: this.formatar.data(api.createdAt),
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
        tipo: 'Boa',
        pesoCaixa: api.boaPeso ?? 0,
        precoCaixa: api.boaPrecoCaixa ?? 0,
        caixas: api.boaCaixas ?? 0,
        valorTotal: api.boaValorTotal ?? 0,
        pesoTotal: api.boaPesoTotal ?? 0,
        precoQuilo: api.boaPrecoQuilo ?? 0,
      },

      fraca: {
        tipo: 'Fraca',
        pesoCaixa: api.fracaPeso ?? 0,
        precoCaixa: api.fracaPrecoCaixa ?? 0,
        caixas: api.fracaCaixas ?? 0,
        valorTotal: api.fracaValorTotal ?? 0,
        pesoTotal: api.fracaPesoTotal ?? 0,
        precoQuilo: api.fracaPrecoQuilo ?? 0,
      },

      valorTotal: {
        valor: api.valorTotal ?? 0,
        pesos: api.pesoTotal ?? 0,
        mediaQuilos: api.mediaQuilo ?? 0,
        mediaCaixas: api.mediaCaixa ?? 0,
      },
    };
  }
}
