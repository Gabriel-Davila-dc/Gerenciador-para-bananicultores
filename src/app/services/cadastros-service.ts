import { Injectable } from '@angular/core';

export type TipoCadastro = 'bananais' | 'servicos' | 'trabalhadores';

// listas iniciais, pra tela não abrir vazia. o usuário pode apagar e criar as dele.
const PADROES: Record<TipoCadastro, string[]> = {
  bananais: ['Bananal da Serra', 'Talhão do Córrego', 'Talhão Novo'],
  servicos: [
    'Adubação',
    'Calcário',
    'Colheita',
    'Combate à Sigatoka',
    'Desbrota',
    'Ensacamento de cachos',
    'Irrigação',
    'Roçada',
  ],
  trabalhadores: ['Cooperativa', 'Diarista', 'Equipe própria', 'Terceirizado'],
};

@Injectable({
  providedIn: 'root',
})
export class CadastrosService {
  listar(tipo: TipoCadastro): string[] {
    const salvos = localStorage.getItem(this.chave(tipo));

    if (!salvos) {
      this.guardar(tipo, PADROES[tipo]);
      return [...PADROES[tipo]];
    }

    return JSON.parse(salvos);
  }

  adicionar(tipo: TipoCadastro, valor: string): string[] {
    const novo = valor.trim();
    const itens = this.listar(tipo);

    if (!novo) {
      return itens;
    }

    // compara sem diferenciar maiúscula, senão "Desbrota" e "desbrota" viram dois
    const jaExiste = itens.some((item) => item.toLowerCase() === novo.toLowerCase());

    if (!jaExiste) {
      itens.push(novo);
      itens.sort((a, b) => a.localeCompare(b, 'pt-BR'));
      this.guardar(tipo, itens);
    }

    return itens;
  }

  renomear(tipo: TipoCadastro, antigo: string, novo: string): string[] {
    const valor = novo.trim();
    const itens = this.listar(tipo);

    if (!valor || valor === antigo) {
      return itens;
    }

    // renomeou pra um nome que já existe: junta os dois, tirando o antigo
    const jaExiste = itens.some(
      (item) => item !== antigo && item.toLowerCase() === valor.toLowerCase(),
    );

    if (jaExiste) {
      return this.remover(tipo, antigo);
    }

    const atualizados = itens.map((item) => (item === antigo ? valor : item));
    atualizados.sort((a, b) => a.localeCompare(b, 'pt-BR'));
    this.guardar(tipo, atualizados);

    return atualizados;
  }

  remover(tipo: TipoCadastro, valor: string): string[] {
    const itens = this.listar(tipo).filter((item) => item !== valor);
    this.guardar(tipo, itens);
    return itens;
  }

  private chave(tipo: TipoCadastro): string {
    return `cadastro-${tipo}`;
  }

  private guardar(tipo: TipoCadastro, itens: string[]): void {
    localStorage.setItem(this.chave(tipo), JSON.stringify(itens));
  }
}
