import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BtnFiltro } from '../btn-filtro/btn-filtro';
import { InputFiltro } from '../input-filtro/input-filtro';
import { Results } from '../results/results';
import { OpcaoSeletor, Seletor } from '../seletor/seletor';

import { Contas } from '../../services/contas';
import { CadastrosService } from '../../services/cadastros-service';
import { CompradoresService } from '../../services/compradores-service';
import { Formatar } from '../../services/formatar';

import { Venda } from '../../models/venda';
import { Categoria } from '../../models/categoria';
import { ResumoTotal } from '../../models/resumo-total';
import { Comprador } from '../../models/comprador';

// primeira linha das duas listas: venda pode ser registrada sem comprador e
// sem bananal, e a lista precisa deixar isso escolher de volta
const NAO_INFORMAR = 'Não informar';

type Valores = [peso: number, preco: number, quantidade: number];
type Resultados = [valor: number, peso: number, preco: number];

/**
 * A calculadora da landing page, reaproveitada para editar.
 *
 * Sem `vendaInicial` é a tela de criar: começa em branco e emite `salva` para
 * quem quiser gravar a venda nova. Com `vendaInicial`, abre já preenchida com
 * os dados daquela venda, editável em todos os campos, e `salva` emite a
 * versão recalculada para quem for atualizar.
 */
@Component({
  selector: 'app-calculadora-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BtnFiltro,
    InputFiltro,
    Results,
    Seletor,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './calculadora-form.html',
  styleUrl: './calculadora-form.css',
})
export class CalculadoraForm implements OnInit {
  @Input() vendaInicial: Venda | null = null;
  @Input() textoBotao = 'Salvar Venda';

  @Output() salva = new EventEmitter<Venda>();
  @Output() cancelarEdicao = new EventEmitter<void>();

  moverCaminhao = false;

  inputPrecoCaixa = {
    name: 'precoCaixa',
    title: 'Preço da Caixa',
    result: 'Valor do Quilo:',
  };

  inputPrecoQuilo = {
    name: 'precoQuilo',
    title: 'Preço do Quilo',
    result: 'Valor da Caixa:',
  };

  // para sabermos se estamos fazendo contas com simples ou classificadas
  filtroNegocio = '';
  // para sabermos se estamos fazendo contas com peso da caixa ou de quilo
  filtroPeso = '';

  // valor com que o botão Simples/Classificada nasce pré-marcado ao editar.
  // É um campo à parte, e não `filtroNegocio` direto: esse último muda pelo
  // próprio evento que o botão emite ao nascer, e alimentar seu [selecionado]
  // com um valor que ele mesmo altera no mesmo ciclo dispara
  // ExpressionChangedAfterItHasBeenCheckedError.
  protected negocioInicial: string | null = null;

  valores: Valores = [0, 0, 0];
  valoresBoa: Valores = [0, 0, 0];
  valoresFraca: Valores = [0, 0, 0];

  resultados: Resultados = [0, 0, 0];
  resultadosBoa: Resultados = [0, 0, 0];
  resultadosFraca: Resultados = [0, 0, 0];
  mediaNaoMostrada = 0;

  bananal = '';
  bananais: string[] = [];
  compradorId: number | null = null;
  compradores: Comprador[] = [];

  dataISO: string;

  protected get opcoesComprador(): OpcaoSeletor[] {
    return [
      { valor: null, rotulo: NAO_INFORMAR },
      ...this.compradores.map((comprador) => ({
        valor: comprador.id,
        rotulo: comprador.nome,
      })),
    ];
  }

  protected get opcoesBananal(): OpcaoSeletor[] {
    return [
      { valor: '', rotulo: NAO_INFORMAR },
      ...this.bananais.map((item) => ({ valor: item, rotulo: item })),
    ];
  }

  constructor(
    private cadastros: CadastrosService,
    private compradoresService: CompradoresService,
    private formatar: Formatar,
    private cd: ChangeDetectorRef,
  ) {
    this.bananais = this.cadastros.listarNomes('bananais');
    this.compradores = this.compradoresService.listar();
    this.dataISO = this.formatar.hojeISO();
    this.sincronizarListas();
  }

  ngOnInit(): void {
    if (this.vendaInicial) {
      this.preencherComVenda(this.vendaInicial);
    }
  }

  private async sincronizarListas(): Promise<void> {
    await this.cadastros.carregarDoServidor();
    await this.compradoresService.carregarDoServidor();

    this.bananais = this.cadastros.listarNomes('bananais');
    this.compradores = this.compradoresService.listar();

    // zoneless: o que muda depois do await não é percebido sozinho
    this.cd.markForCheck();
  }

  /**
   * Reabre a calculadora no estado em que a venda foi salva.
   *
   * Sempre "por Caixa": é o valor que toda venda guarda de verdade (o preço
   * por quilo é sempre derivado dele, tanto aqui quanto em `Contas`), então
   * vale como ponto de partida não importa em qual modo a venda foi criada.
   */
  private preencherComVenda(venda: Venda): void {
    this.filtroNegocio = venda.tipo;
    this.negocioInicial = venda.tipo;
    this.filtroPeso = 'Caixa';
    this.bananal = venda.bananal ?? '';
    this.compradorId = venda.compradorId;
    this.dataISO = this.formatar.dataBRParaISO(venda.data);

    if (venda.tipo === 'Simples') {
      this.valores = [venda.simples.pesoCaixa, venda.simples.precoCaixa, venda.simples.caixas];
      this.resultados = [venda.simples.valorTotal, venda.simples.pesoTotal, venda.simples.precoQuilo];
      return;
    }

    this.valoresBoa = [venda.boa.pesoCaixa, venda.boa.precoCaixa, venda.boa.caixas];
    this.valoresFraca = [venda.fraca.pesoCaixa, venda.fraca.precoCaixa, venda.fraca.caixas];
    this.resultadosBoa = [venda.boa.valorTotal, venda.boa.pesoTotal, venda.boa.precoQuilo];
    this.resultadosFraca = [venda.fraca.valorTotal, venda.fraca.pesoTotal, venda.fraca.precoQuilo];
    this.resultados = [venda.valorTotal.valor, venda.valorTotal.pesos, venda.valorTotal.mediaQuilos];
    this.mediaNaoMostrada = venda.valorTotal.mediaCaixas;
  }

  /* =====================
     Setters de Filtro
  ===================== */

  setFiltroNegocio(valor: string): void {
    // o botão de filtro emite o próprio valor logo ao nascer, mesmo quando já
    // é o que a venda sendo editada já tinha: sem essa checagem, o formulário
    // preenchido era zerado no mesmo instante em que aparecia na tela
    const mudou = this.filtroNegocio !== valor;
    const eraSimples = this.filtroNegocio === 'Simples';
    this.filtroNegocio = valor;

    if (!mudou) {
      return;
    }

    // Simples -> Classificada com algo já digitado: sobretudo ao editar uma
    // venda salva como Simples, é a mesma venda que passa a ter Boa e Fraca —
    // perder o que já estava preenchido obrigaria a digitar tudo de novo.
    // Vira o ponto de partida da "Boa"; a Fraca fica em branco para completar.
    if (eraSimples && valor === 'Classificada' && this.valores[0]) {
      this.valoresBoa = [...this.valores];
      this.valoresFraca = [0, 0, 0];
      this.calcular(this.valoresBoa, 'boa');
      return;
    }

    this.calcular(this.valores, 'simples');
    this.atualizarPagina();
  }

  setFiltroPeso(valor: string): void {
    const mudou = this.filtroPeso !== valor;
    this.filtroPeso = valor;

    if (mudou) {
      this.calcular(this.valores, 'simples');
      this.atualizarPagina();
    }
  }

  /* =====================
     Recebe valores dos inputs
  ===================== */

  //a cada digitação, ativa a função:
  setValores(valor: number[], tipo: 'boa' | 'fraca' | 'simples'): void {
    const dados: Valores = [valor[0], valor[1], valor[2]];

    switch (tipo) {
      //digitando boa
      case 'boa':
        this.valoresBoa = dados;
        this.calcular(this.valoresBoa, 'boa');

        // 👇 se fraca ainda não tem peso, copia da boa
        if (!this.valoresFraca[0]) {
          this.valoresFraca = [
            this.valoresBoa[0], // peso copiado
            this.valoresFraca[1],
            this.valoresFraca[2],
          ];
        }

        break;
      //digitando fraca
      case 'fraca':
        this.valoresFraca = dados;
        this.calcular(this.valoresFraca, 'fraca');
        break;
      //digitando simples
      default:
        this.valores = dados;
        this.calcular(this.valores, 'simples');
    }
  }

  /* =====================
     Cálculo principal
  ===================== */
  calcular(valores: Valores, tipo: 'boa' | 'fraca' | 'simples'): void {
    if ((!valores[0] || !valores[1]) && (this.valoresBoa[0] === 0 || this.valoresFraca[0] === 0)) {
      this.resultados = [0, 0, 0];
      return;
    }

    const contas = new Contas();
    let resultado: number[];

    resultado =
      this.filtroPeso !== 'Quilo'
        ? contas.caixa(valores[0], valores[1], valores[2])
        : contas.quilo(valores[0], valores[1], valores[2]);

    if (tipo === 'boa') {
      this.resultadosBoa = resultado as Resultados;
    } else if (tipo === 'fraca') {
      this.resultadosFraca = resultado as Resultados;
    } else {
      this.resultados = resultado as Resultados;
      return;
    }

    // Média quando é classificada
    const resulMedia: number[] =
      this.filtroPeso !== 'Quilo'
        ? (contas.mediaCaixa(
            this.resultadosBoa,
            this.resultadosFraca,
            this.valoresBoa[2],
            this.valoresFraca[2],
          ) as Resultados)
        : (contas.mediaQuilo(
            this.resultadosBoa,
            this.resultadosFraca,
            this.valoresBoa[2],
            this.valoresFraca[2],
          ) as Resultados);
    this.resultados = [resulMedia[0], resulMedia[1], resulMedia[2]];
    this.mediaNaoMostrada = resulMedia[3];
  }

  /* =====================
     Salvar
  ===================== */

  private montarVenda(): Venda {
    //boa
    const caixaBoa: Categoria = {
      tipo: 'boa',
      pesoCaixa: this.valoresBoa[0],
      precoCaixa: this.valoresBoa[1],
      caixas: this.valoresBoa[2],

      valorTotal: this.resultadosBoa[0],
      pesoTotal: this.resultadosBoa[1],
      precoQuilo: this.resultadosBoa[2],
    };

    if (this.filtroPeso === 'Quilo') {
      caixaBoa.precoCaixa = this.resultadosBoa[2];
      caixaBoa.precoQuilo = this.valoresBoa[1];
    }

    //fraca
    const caixaFraca: Categoria = {
      tipo: 'fraca',
      pesoCaixa: this.valoresFraca[0],
      precoCaixa: this.valoresFraca[1],
      caixas: this.valoresFraca[2],

      valorTotal: this.resultadosFraca[0],
      pesoTotal: this.resultadosFraca[1],
      precoQuilo: this.resultadosFraca[2],
    };

    if (this.filtroPeso === 'Quilo') {
      caixaFraca.precoCaixa = this.resultadosFraca[2];
      caixaFraca.precoQuilo = this.valoresFraca[1];
    }

    const caixaTotal: ResumoTotal = {
      valor: this.resultados[0],
      pesos: this.resultados[1],
      mediaQuilos: this.resultados[2],
      mediaCaixas: this.mediaNaoMostrada,
    };

    const caixaSimples: Categoria = {
      tipo: 'Simples',
      pesoCaixa: this.valores[0],
      precoCaixa: this.valores[1],
      caixas: this.valores[2],

      valorTotal: this.resultados[0],
      pesoTotal: this.resultados[1],
      precoQuilo: this.resultados[2],
    };

    if (this.filtroPeso === 'Quilo') {
      caixaSimples.precoCaixa = this.resultados[2];
      caixaSimples.precoQuilo = this.valores[1];
    }

    return {
      // mantém o id e o status de pago da venda original; venda nova não tem
      // nenhum dos dois ainda (o id definitivo vem do servidor)
      id: this.vendaInicial?.id,
      pago: this.vendaInicial?.pago ?? false,

      // o nome do comprador escolhido vai gravado junto, para o histórico
      // continuar legível mesmo se o cadastro for apagado depois
      nome: this.compradores.find((comprador) => comprador.id === this.compradorId)?.nome ?? '',
      bananal: this.bananal,
      compradorId: this.compradorId,
      data: this.formatar.isoParaBR(this.dataISO),
      tipo: this.filtroNegocio,
      simples: caixaSimples,
      boa: caixaBoa,
      fraca: caixaFraca,
      valorTotal: caixaTotal,
    };
  }

  salvar(): void {
    this.ativarAnimacao();
    this.salva.emit(this.montarVenda());
  }

  cancelar(): void {
    this.cancelarEdicao.emit();
  }

  private ativarAnimacao(): void {
    this.moverCaminhao = true;

    setTimeout(() => {
      this.moverCaminhao = false;
    }, 0);
  }

  private atualizarPagina(): void {
    this.valoresBoa = [0, 0, 0];
    this.valoresFraca = [0, 0, 0];

    this.resultados = [0, 0, 0];
    this.resultadosBoa = [0, 0, 0];
    this.resultadosFraca = [0, 0, 0];
    this.mediaNaoMostrada = 0;
  }
}
