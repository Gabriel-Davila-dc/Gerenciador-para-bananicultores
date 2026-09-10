import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import {
  FORMAS_PAGAMENTO,
  Investimento,
  SITUACOES_INVESTIMENTO,
  SituacaoInvestimento,
  UNIDADES,
} from '../../models/investimento';
import { InvestimentosService } from '../../services/investimentos-service';
import { Formatar } from '../../services/formatar';

type Filtro = 'Todos' | SituacaoInvestimento;

@Component({
  standalone: true,
  selector: 'app-investimentos',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './investimentos.html',
  styleUrl: './investimentos.css',
})
export class Investimentos {
  investimentos: Investimento[] = [];
  editando: Investimento | null = null;

  filtros: Filtro[] = ['Todos', 'A comprar', 'Comprado'];
  filtro: Filtro = 'Todos';

  situacoes = SITUACOES_INVESTIMENTO;
  formasPagamento = FORMAS_PAGAMENTO;
  unidades = UNIDADES;

  constructor(
    private investimentosService: InvestimentosService,
    protected formatar: Formatar,
    private cd: ChangeDetectorRef,
  ) {
    // mostra o cache na hora e busca o servidor em seguida
    this.carregar();
    this.sincronizar();
  }

  private async sincronizar(): Promise<void> {
    await this.investimentosService.carregarDoServidor();
    this.carregar();

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  carregar(): void {
    this.investimentos = this.investimentosService.listar();
  }

  get visiveis(): Investimento[] {
    if (this.filtro === 'Todos') {
      return this.investimentos;
    }

    return this.investimentos.filter((item) => item.situacao === this.filtro);
  }

  totalDe(situacao: SituacaoInvestimento): number {
    return this.investimentos
      .filter((item) => item.situacao === situacao)
      .reduce((soma, item) => soma + (item.valor || 0), 0);
  }

  quantosDe(situacao: SituacaoInvestimento): number {
    return this.investimentos.filter((item) => item.situacao === situacao).length;
  }

  novo(): void {
    this.editando = {
      id: 0,
      produto: '',
      quantidade: 1,
      unidade: 'unidade',
      valor: 0,
      data: this.formatar.hojeISO(),
      formaPagamento: 'Pix',
      situacao: 'A comprar',
      observacao: '',
    };
  }

  editar(investimento: Investimento): void {
    // clone: cancelar não pode deixar o card alterado pela metade
    this.editando = { ...investimento };
  }

  salvar(): void {
    if (!this.editando) {
      return;
    }

    this.investimentosService.salvar(this.editando);
    this.editando = null;
    this.carregar();
  }

  apagar(investimento: Investimento): void {
    this.investimentosService.apagar(investimento.id);
    this.editando = null;
    this.carregar();
  }

  // atalho do card: marca como comprado sem abrir o formulário
  marcarComprado(investimento: Investimento): void {
    this.investimentosService.salvar({ ...investimento, situacao: 'Comprado' });
    this.carregar();
  }

  fechar(): void {
    this.editando = null;
  }
}
