import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';

import { Historico } from './historico';
import { Salvar } from '../../services/salvar';
import { Contas } from '../../services/contas';
import { CompradoresService } from '../../services/compradores-service';
import { Venda } from '../../models/venda';
import { Comprador } from '../../models/comprador';

function venda(id: number, compradorId: number | null, nome: string): Venda {
  const zero = { tipo: '', pesoCaixa: 0, precoCaixa: 0, caixas: 0, valorTotal: 0, pesoTotal: 0, precoQuilo: 0 };

  return {
    id,
    nome,
    bananal: 'Pedreira',
    compradorId,
    pago: false,
    data: '10/09/2026',
    tipo: 'Simples',
    simples: { ...zero, valorTotal: 400, pesoTotal: 200 },
    boa: { ...zero },
    fraca: { ...zero },
    valorTotal: { valor: 400, pesos: 200, mediaQuilos: 2, mediaCaixas: 40 },
  };
}

/**
 * Espera o Angular reagir sozinho.
 *
 * De propósito NÃO usa fixture.whenStable() nem detectChanges(): os dois
 * forçam uma verificação e mascarariam justamente o bug que estes testes
 * existem para pegar (a tela que não redesenha após um await). Aqui só
 * damos tempo para o redesenho que o próprio componente agendou.
 */
async function deixarOAngularReagir(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

const COMPRADORES: Comprador[] = [
  { id: 7, nome: 'Mercado do Zé', telefone: '', foto: '' },
  { id: 8, nome: 'Feira do Bairro', telefone: '', foto: '' },
];

describe('Historico', () => {
  let fixture: ComponentFixture<Historico>;
  let componente: Historico;
  let vendasNoServidor: Venda[];
  let salvarFalso: Partial<Salvar>;
  let compradoresChegaram: boolean;

  // resolve só depois que o teste mandar, para simular a rede demorando
  let liberarVendas: (v: Venda[]) => void;

  async function montar(queryParams: Record<string, string> = {}) {
    compradoresChegaram = false;
    vendasNoServidor = [
      venda(1, 7, 'Mercado do Zé'),
      venda(2, 7, 'Mercado do Zé'),
      venda(3, 8, 'Feira do Bairro'),
      venda(4, null, 'Avulso'),
    ];

    salvarFalso = {
      pegarVendas: () =>
        new Promise<Venda[]>((resolve) => {
          liberarVendas = resolve;
        }),
      apagarVenda: (id: number) => {
        vendasNoServidor = vendasNoServidor.filter((v) => v.id !== id);
        return Promise.resolve();
      },
      atualizarVenda: () => Promise.resolve(),
    };

    await TestBed.configureTestingModule({
      imports: [Historico],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Salvar, useValue: salvarFalso },
        { provide: Contas, useValue: {} },
        {
          // reproduz o caso real: o cache do aparelho começa vazio e a lista
          // de compradores só existe depois que o servidor responde. é essa
          // ordem que fazia o select zerar o filtro vindo da URL.
          provide: CompradoresService,
          useValue: {
            listar: () => (compradoresChegaram ? COMPRADORES : []),
            carregarDoServidor: () => {
              compradoresChegaram = true;
              return Promise.resolve();
            },
          },
        },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Historico);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function textoDaTela(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function quantosCards(): number {
    return (fixture.nativeElement as HTMLElement).querySelectorAll('app-card-salvo').length;
  }

  // ATENÇÃO: verifiquei quebrando o código de propósito e só o teste da
  // exclusão falha. Os dois primeiros passam mesmo sem o markForCheck, porque
  // o TestBed acaba forçando uma verificação no meio do caminho. Eles
  // documentam o comportamento esperado, mas NÃO protegem contra a regressão
  // do zoneless: quem faz isso é o terceiro.
  it('mostra as vendas assim que chegam, sem precisar de outro clique', async () => {
    await montar();

    expect(textoDaTela()).withContext('devia estar carregando').toContain('Carregando');

    // a rede responde
    liberarVendas(vendasNoServidor);
    await deixarOAngularReagir();

    // NENHUM evento de clique aqui: se a tela só atualizar depois de interagir,
    // é o bug do zoneless voltando
    expect(componente.vendas.length).toBe(4);
    expect(quantosCards()).withContext('os cards precisam aparecer sozinhos').toBe(4);
    expect(textoDaTela()).not.toContain('Carregando');
  });

  it('aplica o filtro que veio da URL mesmo com os compradores chegando depois', async () => {
    await montar({ comprador: '7' });

    liberarVendas(vendasNoServidor);
    await deixarOAngularReagir();

    expect(componente.compradorFiltro)
      .withContext('o filtro da URL não pode ser zerado quando as opções carregam')
      .toBe(7);
    expect(componente.vendasFiltradas.length).toBe(2);
    expect(quantosCards()).withContext('só as vendas do comprador 7').toBe(2);
  });

  it('remove o card da tela na hora em que a venda é excluída', async () => {
    await montar();

    liberarVendas(vendasNoServidor);
    await deixarOAngularReagir();
    expect(quantosCards()).toBe(4);

    // a próxima leitura devolve a lista já sem a venda apagada
    salvarFalso.pegarVendas = () => Promise.resolve(vendasNoServidor);

    await componente.apagar(1);
    await fixture.whenStable();

    expect(quantosCards()).withContext('o card devia sumir sem clicar de novo').toBe(3);
  });
});
