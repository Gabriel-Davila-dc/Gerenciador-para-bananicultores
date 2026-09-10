import { Injectable } from '@angular/core';
import { Comprador } from '../models/comprador';
import { SincronizacaoService } from './sincronizacao-service';
import { CompradoresApi } from './compradores-api';
import { Salvar } from './salvar';

export const RECURSO_COMPRADORES = 'compradores';

const CHAVE = 'compradores-cache';

@Injectable({
  providedIn: 'root',
})
export class CompradoresService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: CompradoresApi,
    private salvarVendas: Salvar,
  ) {
    this.sincronizacao.registrar(RECURSO_COMPRADORES, {
      criar: (dados) => this.api.criar(dados as Comprador),
      editar: (dados) => this.api.editar(dados as Comprador),
      apagar: (id) => this.api.apagar(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarId(idLocal, idServidor),
    });
  }

  listar(): Comprador[] {
    const salvos = localStorage.getItem(CHAVE);
    const compradores: Comprador[] = salvos ? JSON.parse(salvos) : [];

    return compradores.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  porId(id: number | null): Comprador | undefined {
    return id ? this.listar().find((comprador) => comprador.id === id) : undefined;
  }

  salvar(comprador: Comprador): void {
    const compradores = this.listar();
    const index = compradores.findIndex((item) => item.id === comprador.id);

    if (index === -1) {
      comprador.id = -Date.now();
      compradores.push(comprador);
      this.sincronizacao.enfileirar(RECURSO_COMPRADORES, 'criar', comprador.id, comprador);
    } else {
      compradores[index] = comprador;

      const criacao = this.sincronizacao.criacaoPendente(RECURSO_COMPRADORES, comprador.id);

      if (criacao) {
        this.sincronizacao.atualizarDados(criacao.id, comprador);
      } else {
        this.sincronizacao.enfileirar(RECURSO_COMPRADORES, 'editar', comprador.id, comprador);
      }
    }

    this.guardar(compradores);
  }

  apagar(id: number): void {
    this.guardar(this.listar().filter((item) => item.id !== id));

    const naoEnviado = !!this.sincronizacao.criacaoPendente(RECURSO_COMPRADORES, id);
    this.sincronizacao.removerDoRegistro(RECURSO_COMPRADORES, id);

    if (!naoEnviado) {
      this.sincronizacao.enfileirar(RECURSO_COMPRADORES, 'apagar', id);
    }
  }

  async carregarDoServidor(): Promise<void> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.api.listar();
      this.guardar(this.sincronizacao.mesclar(RECURSO_COMPRADORES, this.listar(), doServidor));
    } catch {
      // sem servidor: segue com o cache do aparelho
    }
  }

  /**
   * Reduz a foto antes de guardar. A imagem original de celular passa de 3 MB,
   * o que estouraria a cota do localStorage em poucos compradores e deixaria
   * cada sincronização pesadíssima. 240px já basta para um avatar.
   */
  async prepararFoto(arquivo: File): Promise<string> {
    const bitmap = await createImageBitmap(arquivo);
    const lado = Math.min(bitmap.width, bitmap.height);
    const destino = 240;

    const canvas = document.createElement('canvas');
    canvas.width = destino;
    canvas.height = destino;

    const contexto = canvas.getContext('2d');

    if (!contexto) {
      throw new Error('Não foi possível preparar a imagem');
    }

    // recorte quadrado central, para o avatar não distorcer
    contexto.drawImage(
      bitmap,
      (bitmap.width - lado) / 2,
      (bitmap.height - lado) / 2,
      lado,
      lado,
      0,
      0,
      destino,
      destino,
    );

    bitmap.close();

    return canvas.toDataURL('image/jpeg', 0.7);
  }

  private trocarId(idLocal: number, idServidor: number): void {
    const compradores = this.listar();
    const comprador = compradores.find((item) => item.id === idLocal);

    if (comprador) {
      comprador.id = idServidor;
      this.guardar(compradores);
    }

    // as vendas que já apontavam para o id temporário precisam acompanhar
    this.salvarVendas.trocarCompradorId(idLocal, idServidor);
  }

  private guardar(compradores: Comprador[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(compradores));
  }
}
