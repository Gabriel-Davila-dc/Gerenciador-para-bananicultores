import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { Comprador } from '../../models/comprador';
import { Venda } from '../../models/venda';
import { CompradoresService } from '../../services/compradores-service';
import { Salvar } from '../../services/salvar';
import { Formatar } from '../../services/formatar';

@Component({
  standalone: true,
  selector: 'app-compradores',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './compradores.html',
  styleUrl: './compradores.css',
})
export class Compradores {
  compradores: Comprador[] = [];
  private vendas: Venda[] = [];

  editando: Comprador | null = null;
  preparandoFoto = false;
  erroFoto = '';

  constructor(
    private compradoresService: CompradoresService,
    private salvar: Salvar,
    protected formatar: Formatar,
    private cd: ChangeDetectorRef,
  ) {
    this.carregar();
    this.sincronizar();
  }

  private carregar(): void {
    this.compradores = this.compradoresService.listar();
  }

  private async sincronizar(): Promise<void> {
    await this.compradoresService.carregarDoServidor();
    this.carregar();
    this.vendas = await this.salvar.pegarVendas();

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  // ----- números por comprador -----

  private vendasDe(comprador: Comprador): Venda[] {
    return this.vendas.filter((venda) => venda.compradorId === comprador.id);
  }

  quantasVendas(comprador: Comprador): number {
    return this.vendasDe(comprador).length;
  }

  totalComprado(comprador: Comprador): number {
    return this.vendasDe(comprador).reduce(
      (soma, venda) => soma + (venda.valorTotal?.valor || 0),
      0,
    );
  }

  // o que está vendido e ainda não foi pago
  emAberto(comprador: Comprador): number {
    return this.vendasDe(comprador)
      .filter((venda) => !venda.pago)
      .reduce((soma, venda) => soma + (venda.valorTotal?.valor || 0), 0);
  }

  iniciais(comprador: Comprador): string {
    return comprador.nome
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join('');
  }

  // ----- formulário -----

  novo(): void {
    this.editando = { id: 0, nome: '', telefone: '', foto: '' };
    this.erroFoto = '';
  }

  editar(comprador: Comprador): void {
    // clone: cancelar não pode deixar o card alterado pela metade
    this.editando = { ...comprador };
    this.erroFoto = '';
  }

  async escolherFoto(evento: Event): Promise<void> {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];

    if (!arquivo || !this.editando) {
      return;
    }

    this.preparandoFoto = true;
    this.erroFoto = '';

    try {
      this.editando.foto = await this.compradoresService.prepararFoto(arquivo);
    } catch {
      this.erroFoto = 'Não deu para usar essa imagem. Tente outra.';
    } finally {
      this.preparandoFoto = false;
      // sem isto a prévia da foto não aparece: a leitura é assíncrona
      this.cd.markForCheck();
    }
  }

  removerFoto(): void {
    if (this.editando) {
      this.editando.foto = '';
    }
  }

  salvarComprador(): void {
    if (!this.editando || !this.editando.nome.trim()) {
      return;
    }

    this.compradoresService.salvar(this.editando);
    this.editando = null;
    this.carregar();
  }

  apagar(comprador: Comprador): void {
    this.compradoresService.apagar(comprador.id);
    this.editando = null;
    this.carregar();
  }

  fechar(): void {
    this.editando = null;
  }
}
