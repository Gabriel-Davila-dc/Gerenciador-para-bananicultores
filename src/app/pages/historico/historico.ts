import { Venda } from './../../models/venda';
import { ChangeDetectorRef, Component } from '@angular/core';
import { CardSalvo } from '../../components/card-salvo/card-salvo';
import { Salvar } from '../../services/salvar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UpdateVenda } from '../../components/update-venda/update-venda';
import { Contas } from '../../services/contas';
import { CompradoresService } from '../../services/compradores-service';
import { Comprador } from '../../models/comprador';

@Component({
  standalone: true,
  selector: 'app-historico',
  imports: [CardSalvo, CommonModule, FormsModule, RouterModule, UpdateVenda],
  templateUrl: './historico.html',
  styleUrl: './historico.css',
})
export class Historico {
  vendas: Venda[] = [];
  carregando = true;

  compradores: Comprador[] = [];
  // '' = todos; vem da URL quando você chega pela tela de compradores
  compradorFiltro: number | '' = '';

  Editando: Venda | null = null;
  email: string = localStorage.getItem('email') || 'Nenhum';

  constructor(
    private salvar: Salvar,
    private contas: Contas,
    private compradoresService: CompradoresService,
    private rota: ActivatedRoute,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.email = localStorage.getItem('email') || 'Nenhum';
    this.compradores = this.compradoresService.listar();
    this.aplicarFiltroDaUrl();
    this.carregar();
  }

  // o filtro vem da URL quando você chega pela tela de compradores
  private aplicarFiltroDaUrl(): void {
    const daUrl = this.rota.snapshot.queryParamMap.get('comprador');
    this.compradorFiltro = daUrl ? Number(daUrl) : '';
  }

  private async carregar(): Promise<void> {
    this.carregando = true;

    await this.compradoresService.carregarDoServidor();
    this.compradores = this.compradoresService.listar();

    // a lista de compradores só existe agora; sem reaplicar, o ngModel do
    // select não acha a opção correspondente e zera o filtro que veio da URL
    this.aplicarFiltroDaUrl();

    this.vendas = await this.salvar.pegarVendas();
    this.carregando = false;

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  get vendasFiltradas(): Venda[] {
    if (this.compradorFiltro === '') {
      return this.vendas;
    }

    return this.vendas.filter((venda) => venda.compradorId === this.compradorFiltro);
  }

  get totalEmAberto(): number {
    return this.vendasFiltradas
      .filter((venda) => !venda.pago)
      .reduce((soma, venda) => soma + (venda.valorTotal?.valor || 0), 0);
  }

  async apagar(id: number) {
    await this.salvar.apagarVenda(id);
    this.vendas = await this.salvar.pegarVendas();
    this.cd.markForCheck();
  }

  async alternarPago(venda: Venda) {
    await this.salvar.atualizarVenda({ ...venda, pago: !venda.pago });
    this.vendas = await this.salvar.pegarVendas();
    this.cd.markForCheck();
  }

  editarVenda(vendaEditada: Venda) {
    this.Editando = vendaEditada;
  }

  async atualizarVenda(vendaAtualizada: Venda) {
    await this.salvar.atualizarVenda(vendaAtualizada);
    this.vendas = await this.salvar.pegarVendas();
    this.cd.markForCheck();
  }

  fechar() {
    this.Editando = null;
  }
}
