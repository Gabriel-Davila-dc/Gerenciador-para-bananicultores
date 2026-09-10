import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

import { Venda } from '../../models/venda';
import { ServicoCrm } from '../../models/servico-crm';
import { Investimento } from '../../models/investimento';
import { Salvar } from '../../services/salvar';
import { CrmService } from '../../services/crm-service';
import { InvestimentosService } from '../../services/investimentos-service';
import { CadastrosService } from '../../services/cadastros-service';
import { Formatar } from '../../services/formatar';

// paleta categórica validada (validate_palette.js, superfície #ffffff):
// banda de luminosidade, piso de croma, separação para daltonismo e piso de
// visão normal passam. cor segue a entidade, nunca a posição no ranking.
const CORES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300'];

const MAX_SERIES = 5; // além disso vira "Outros": nunca gerar uma 7ª cor

type AgrupamentoServico = 'responsavel' | 'bananal' | 'servico';

interface Ponto {
  x: number;
  y: number;
  rotulo: string;
  valor: number;
}

interface Serie {
  nome: string;
  cor: string;
  pontos: Ponto[];
  caminho: string;
}

interface Fatia {
  nome: string;
  cor: string;
  valor: number;
  percentual: number;
  caminho: string;
  // posição do rótulo direto sobre a fatia
  rotuloX: number;
  rotuloY: number;
}

@Component({
  standalone: true,
  selector: 'app-metricas',
  imports: [CommonModule, RouterModule, FormsModule, MatIconModule],
  templateUrl: './metricas.html',
  styleUrl: './metricas.css',
})
export class Metricas {
  // ----- filtros (uma linha só, no topo, valendo para tudo que der) -----
  bananais: string[] = [];
  bananalFiltro = '';
  dataDe = '';
  dataAte = '';

  // ----- dados -----
  private vendas: Venda[] = [];
  private servicos: ServicoCrm[] = [];
  private investimentos: Investimento[] = [];

  carregando = true;

  agrupamento: AgrupamentoServico = 'responsavel';
  agrupamentos: { chave: AgrupamentoServico; rotulo: string }[] = [
    { chave: 'responsavel', rotulo: 'Por pessoa' },
    { chave: 'bananal', rotulo: 'Por bananal' },
    { chave: 'servico', rotulo: 'Por serviço' },
  ];

  // tabelas equivalentes de cada gráfico (todo valor precisa existir fora da cor)
  tabelaVendas = false;
  tabelaServicos = false;
  tabelaInvestimentos = false;

  // ponto destacado no hover
  destaqueVendas: number | null = null;
  destaqueServicos: number | null = null;
  destaqueFatia: string | null = null;

  // geometria dos gráficos de linha
  readonly larguraGrafico = 720;
  readonly alturaGrafico = 260;
  readonly margem = { topo: 16, direita: 16, baixo: 34, esquerda: 62 };

  constructor(
    private salvar: Salvar,
    private crmService: CrmService,
    private investimentosService: InvestimentosService,
    private cadastros: CadastrosService,
    protected formatar: Formatar,
    private cd: ChangeDetectorRef,
  ) {
    // desenha com o cache imediatamente e atualiza quando o servidor responder
    this.lerCache();
    this.carregarTudo();
  }

  private lerCache(): void {
    this.bananais = this.cadastros.listarNomes('bananais');
    this.servicos = this.crmService.listar();
    this.investimentos = this.investimentosService.listar();
  }

  private async carregarTudo(): Promise<void> {
    await this.cadastros.carregarDoServidor();
    await this.crmService.carregarDoServidor();
    await this.investimentosService.carregarDoServidor();

    this.lerCache();
    this.vendas = await this.salvar.pegarVendas();
    this.carregando = false;

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  limparFiltros(): void {
    this.bananalFiltro = '';
    this.dataDe = '';
    this.dataAte = '';
  }

  // ----- filtragem -----

  private dentroDoPeriodo(iso: string): boolean {
    if (!iso) {
      return !this.dataDe && !this.dataAte;
    }

    // datas em aaaa-mm-dd comparam certo como texto, sem passar por new Date
    if (this.dataDe && iso < this.dataDe) return false;
    if (this.dataAte && iso > this.dataAte) return false;

    return true;
  }

  get vendasFiltradas(): Venda[] {
    return this.vendas.filter((venda) => {
      if (this.bananalFiltro && venda.bananal !== this.bananalFiltro) return false;
      return this.dentroDoPeriodo(this.formatar.dataBRParaISO(venda.data));
    });
  }

  get servicosFiltrados(): ServicoCrm[] {
    return this.servicos.filter((servico) => {
      if (this.bananalFiltro && servico.bananal !== this.bananalFiltro) return false;
      return this.dentroDoPeriodo(servico.dataInicio);
    });
  }

  // investimento não tem bananal, então só o período se aplica
  get investimentosFiltrados(): Investimento[] {
    return this.investimentos.filter((item) => this.dentroDoPeriodo(item.data));
  }

  // ----- visão geral -----

  get totalVendido(): number {
    return this.vendasFiltradas.reduce((soma, venda) => soma + (venda.valorTotal?.valor || 0), 0);
  }

  get pesoVendido(): number {
    return this.vendasFiltradas.reduce((soma, venda) => soma + (venda.valorTotal?.pesos || 0), 0);
  }

  get totalInvestido(): number {
    return this.investimentosFiltrados
      .filter((item) => item.situacao === 'Comprado')
      .reduce((soma, item) => soma + (item.valor || 0), 0);
  }

  get servicosEmAberto(): number {
    return this.servicosFiltrados.filter((servico) => servico.etapa !== 'Finalizado').length;
  }

  get precoMedioQuilo(): number {
    const peso = this.pesoVendido;
    return peso > 0 ? this.totalVendido / peso : 0;
  }

  // ----- eixo de meses, comum aos dois gráficos de linha -----

  private mesDe(iso: string): string {
    return iso ? iso.slice(0, 7) : '';
  }

  private mesesDe(isos: string[]): string[] {
    const meses = [...new Set(isos.filter(Boolean).map((iso) => this.mesDe(iso)))];
    return meses.sort();
  }

  rotuloMes(mes: string): string {
    const [ano, m] = mes.split('-');
    return `${m}/${ano.slice(2)}`;
  }

  // ----- gráfico de vendas -----

  get mesesVendas(): string[] {
    return this.mesesDe(this.vendasFiltradas.map((v) => this.formatar.dataBRParaISO(v.data)));
  }

  get valoresPorMes(): number[] {
    return this.mesesVendas.map((mes) =>
      this.vendasFiltradas
        .filter((venda) => this.mesDe(this.formatar.dataBRParaISO(venda.data)) === mes)
        .reduce((soma, venda) => soma + (venda.valorTotal?.valor || 0), 0),
    );
  }

  get serieVendas(): Serie | null {
    const meses = this.mesesVendas;

    if (meses.length === 0) {
      return null;
    }

    const valores = this.valoresPorMes;
    const maximo = Math.max(...valores, 1);
    const pontos = meses.map((mes, i) => ({
      x: this.posicaoX(i, meses.length),
      y: this.posicaoY(valores[i], maximo),
      rotulo: this.rotuloMes(mes),
      valor: valores[i],
    }));

    return {
      nome: 'Valor vendido',
      cor: CORES[0],
      pontos,
      caminho: this.caminhoDe(pontos),
    };
  }

  get maximoVendas(): number {
    return Math.max(...this.valoresPorMes, 1);
  }

  // ----- gráfico de fluxo de serviços -----

  get mesesServicos(): string[] {
    return this.mesesDe(this.servicosFiltrados.map((s) => s.dataInicio));
  }

  get seriesServicos(): Serie[] {
    const meses = this.mesesServicos;

    if (meses.length === 0) {
      return [];
    }

    const grupos = this.gruposDeServico();
    const maximo = Math.max(
      1,
      ...grupos.flatMap((grupo) => meses.map((mes) => this.contarServicos(grupo, mes))),
    );

    return grupos.map((grupo, indice) => {
      const pontos = meses.map((mes, i) => ({
        x: this.posicaoX(i, meses.length),
        y: this.posicaoY(this.contarServicos(grupo, mes), maximo),
        rotulo: this.rotuloMes(mes),
        valor: this.contarServicos(grupo, mes),
      }));

      return {
        nome: grupo,
        cor: CORES[indice],
        pontos,
        caminho: this.caminhoDe(pontos),
      };
    });
  }

  get maximoServicos(): number {
    const meses = this.mesesServicos;

    return Math.max(
      1,
      ...this.gruposDeServico().flatMap((grupo) =>
        meses.map((mes) => this.contarServicos(grupo, mes)),
      ),
    );
  }

  // os mais frequentes viram séries; o resto soma em "Outros"
  private gruposDeServico(): string[] {
    const contagem = new Map<string, number>();

    this.servicosFiltrados.forEach((servico) => {
      const chave = servico[this.agrupamento] || 'Sem informação';
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1);
    });

    const ordenados = [...contagem.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([chave]) => chave);

    if (ordenados.length <= MAX_SERIES) {
      return ordenados;
    }

    return [...ordenados.slice(0, MAX_SERIES), 'Outros'];
  }

  private contarServicos(grupo: string, mes: string): number {
    const principais = this.gruposDeServico().filter((g) => g !== 'Outros');

    return this.servicosFiltrados.filter((servico) => {
      if (this.mesDe(servico.dataInicio) !== mes) return false;

      const chave = servico[this.agrupamento] || 'Sem informação';
      return grupo === 'Outros' ? !principais.includes(chave) : chave === grupo;
    }).length;
  }

  // ----- gráfico de investimentos (pizza) -----

  get fatiasInvestimento(): Fatia[] {
    const contagem = new Map<string, number>();

    this.investimentosFiltrados.forEach((item) => {
      const chave = item.produto || 'Sem nome';
      contagem.set(chave, (contagem.get(chave) ?? 0) + (item.valor || 0));
    });

    let entradas = [...contagem.entries()].sort((a, b) => b[1] - a[1]);

    // pizza legível vai até 6 fatias; o resto vira "Outros"
    if (entradas.length > 6) {
      const resto = entradas.slice(5).reduce((soma, [, valor]) => soma + valor, 0);
      entradas = [...entradas.slice(0, 5), ['Outros', resto]];
    }

    const total = entradas.reduce((soma, [, valor]) => soma + valor, 0);

    if (total === 0) {
      return [];
    }

    let anguloAtual = -Math.PI / 2; // começa no topo

    return entradas.map(([nome, valor], indice) => {
      const fracao = valor / total;
      const anguloFinal = anguloAtual + fracao * Math.PI * 2;
      const meio = (anguloAtual + anguloFinal) / 2;

      const fatia: Fatia = {
        nome,
        cor: CORES[indice],
        valor,
        percentual: fracao * 100,
        caminho: this.caminhoFatia(anguloAtual, anguloFinal),
        rotuloX: 120 + Math.cos(meio) * 62,
        rotuloY: 120 + Math.sin(meio) * 62,
      };

      anguloAtual = anguloFinal;
      return fatia;
    });
  }

  get totalInvestimentoFatias(): number {
    return this.fatiasInvestimento.reduce((soma, fatia) => soma + fatia.valor, 0);
  }

  // ----- geometria -----

  private posicaoX(indice: number, total: number): number {
    const util = this.larguraGrafico - this.margem.esquerda - this.margem.direita;

    if (total === 1) {
      return this.margem.esquerda + util / 2;
    }

    return this.margem.esquerda + (util * indice) / (total - 1);
  }

  private posicaoY(valor: number, maximo: number): number {
    const util = this.alturaGrafico - this.margem.topo - this.margem.baixo;
    return this.alturaGrafico - this.margem.baixo - (valor / maximo) * util;
  }

  private caminhoDe(pontos: Ponto[]): string {
    return pontos.map((ponto, i) => `${i === 0 ? 'M' : 'L'} ${ponto.x} ${ponto.y}`).join(' ');
  }

  private caminhoFatia(inicio: number, fim: number): string {
    const raio = 100;
    const centro = 120;

    // fatia única: círculo inteiro, que o arco sozinho não desenha
    if (fim - inicio >= Math.PI * 2 - 0.0001) {
      return `M ${centro} ${centro - raio} A ${raio} ${raio} 0 1 1 ${centro - 0.01} ${centro - raio} Z`;
    }

    const x1 = centro + Math.cos(inicio) * raio;
    const y1 = centro + Math.sin(inicio) * raio;
    const x2 = centro + Math.cos(fim) * raio;
    const y2 = centro + Math.sin(fim) * raio;
    const arcoGrande = fim - inicio > Math.PI ? 1 : 0;

    return `M ${centro} ${centro} L ${x1} ${y1} A ${raio} ${raio} 0 ${arcoGrande} 1 ${x2} ${y2} Z`;
  }

  // linhas de grade e marcas do eixo y
  marcasY(maximo: number): { y: number; valor: number }[] {
    return [0, 0.25, 0.5, 0.75, 1].map((fracao) => ({
      y: this.posicaoY(maximo * fracao, maximo),
      valor: maximo * fracao,
    }));
  }

  // faixa larga de hover: alvo maior que o ponto, como manda a boa prática
  larguraFaixa(total: number): number {
    const util = this.larguraGrafico - this.margem.esquerda - this.margem.direita;
    return total > 1 ? util / (total - 1) : util;
  }

  faixaX(indice: number, total: number): number {
    return this.posicaoX(indice, total) - this.larguraFaixa(total) / 2;
  }
}
