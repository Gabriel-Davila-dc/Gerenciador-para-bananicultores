import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Contas } from './contas';
import { Venda } from '../models/venda';
import { Categoria } from '../models/categoria';

function categoria(dados: Partial<Categoria> = {}): Categoria {
  return {
    tipo: '',
    pesoCaixa: 0,
    precoCaixa: 0,
    caixas: 0,
    valorTotal: 0,
    pesoTotal: 0,
    precoQuilo: 0,
    ...dados,
  };
}

function venda(dados: Partial<Venda> = {}): Venda {
  return {
    nome: 'Comprador',
    bananal: '',
    compradorId: null,
    pago: false,
    data: '2026-09-11',
    tipo: 'Simples',
    simples: categoria(),
    boa: categoria(),
    fraca: categoria(),
    valorTotal: { valor: 0, pesos: 0, mediaQuilos: 0, mediaCaixas: 0 },
    ...dados,
  };
}

describe('Contas', () => {
  let contas: Contas;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    contas = TestBed.inject(Contas);
  });

  // ---------- venda fechada por caixa ----------

  describe('caixa', () => {
    it('multiplica preço e peso pelo número de caixas', () => {
      // 10 caixas de 22kg a R$ 55,00
      const [valorTotal, pesoTotal, precoQuilo] = contas.caixa(22, 55, 10);

      expect(valorTotal).toBe(550);
      expect(pesoTotal).toBe(220);
      expect(precoQuilo).toBeCloseTo(2.5, 10);
    });

    // a tela deixa a quantidade vazia quando é uma caixa só
    it('trata quantidade zerada como uma caixa', () => {
      expect(contas.caixa(22, 55, 0)).toEqual(contas.caixa(22, 55, 1));
    });
  });

  // ---------- venda fechada por quilo ----------

  describe('quilo', () => {
    it('multiplica o preço do quilo pelo peso total', () => {
      // 10 caixas de 22kg a R$ 2,50 o quilo
      const [valorTotal, pesoTotal, precoCaixa] = contas.quilo(22, 2.5, 10);

      expect(valorTotal).toBe(550);
      expect(pesoTotal).toBe(220);
      expect(precoCaixa).toBe(55);
    });

    it('trata quantidade zerada como uma caixa', () => {
      expect(contas.quilo(22, 2.5, 0)).toEqual(contas.quilo(22, 2.5, 1));
    });

    // as duas formas de fechar a mesma venda têm que dar no mesmo dinheiro
    it('chega ao mesmo total que a conta por caixa', () => {
      const porCaixa = contas.caixa(22, 55, 10);
      const porQuilo = contas.quilo(22, 2.5, 10);

      expect(porQuilo[0]).toBeCloseTo(porCaixa[0], 10);
      expect(porQuilo[1]).toBeCloseTo(porCaixa[1], 10);
    });
  });

  // ---------- médias da venda classificada ----------

  describe('médias', () => {
    // boa: 10 caixas de 22kg a R$ 55 = R$ 550 / 220kg
    // fraca: 5 caixas de 20kg a R$ 30 = R$ 150 / 100kg
    const boa = [550, 220];
    const fraca = [150, 100];

    it('soma as duas categorias e tira a média por quilo e por caixa', () => {
      const [valorTotal, pesoTotal, precoQuilo, precoCaixa] = contas.mediaCaixa(boa, fraca, 10, 5);

      expect(valorTotal).toBe(700);
      expect(pesoTotal).toBe(320);
      expect(precoQuilo).toBeCloseTo(700 / 320, 10);
      expect(precoCaixa).toBeCloseTo(700 / 15, 10);
    });

    /**
     * mediaCaixa e mediaQuilo fazem a mesma conta e devolvem as mesmas quatro
     * casas, só que com as duas últimas em ordem trocada. Quem chamar sem
     * reparar nisso troca preço por quilo com preço por caixa.
     */
    it('devolvem os mesmos valores, com as duas médias em ordem trocada', () => {
      const porCaixa = contas.mediaCaixa(boa, fraca, 10, 5);
      const porQuilo = contas.mediaQuilo(boa, fraca, 10, 5);

      expect(porQuilo[0]).toBe(porCaixa[0]);
      expect(porQuilo[1]).toBe(porCaixa[1]);
      expect(porQuilo[2]).toBe(porCaixa[3]);
      expect(porQuilo[3]).toBe(porCaixa[2]);
    });
  });

  // ---------- recalcular ao editar uma venda salva ----------

  describe('recalcular', () => {
    it('venda simples: refaz tudo pelo preço da caixa quando ele muda', () => {
      const antiga = venda({
        tipo: 'Simples',
        simples: categoria({ pesoCaixa: 22, precoCaixa: 50, precoQuilo: 2.5, caixas: 10 }),
      });
      const nova = venda({
        tipo: 'Simples',
        simples: categoria({ pesoCaixa: 22, precoCaixa: 55, precoQuilo: 2.5, caixas: 10 }),
      });

      const resultado = contas.recalcular([antiga, nova]);

      expect(resultado.simples.valorTotal).toBe(550);
      expect(resultado.simples.pesoTotal).toBe(220);
      expect(resultado.simples.precoQuilo).toBeCloseTo(2.5, 10);
      expect(resultado.valorTotal.valor).toBe(550);
    });

    it('venda simples: refaz tudo pelo preço do quilo quando a caixa não mudou', () => {
      const antiga = venda({
        tipo: 'Simples',
        simples: categoria({ pesoCaixa: 22, precoCaixa: 55, precoQuilo: 2.5, caixas: 10 }),
      });
      const nova = venda({
        tipo: 'Simples',
        simples: categoria({ pesoCaixa: 22, precoCaixa: 55, precoQuilo: 3, caixas: 10 }),
      });

      const resultado = contas.recalcular([antiga, nova]);

      expect(resultado.simples.valorTotal).toBe(660);
      // o preço da caixa acompanha o novo preço do quilo
      expect(resultado.simples.precoCaixa).toBe(66);
      // e o preço do quilo continua sendo o que foi digitado
      expect(resultado.simples.precoQuilo).toBe(3);
    });

    it('venda classificada: refaz as duas categorias pelo preço da caixa', () => {
      const antiga = venda({
        tipo: 'Classificada',
        boa: categoria({ pesoCaixa: 22, precoCaixa: 50, caixas: 10 }),
        fraca: categoria({ pesoCaixa: 20, precoCaixa: 30, caixas: 5 }),
      });
      const nova = venda({
        tipo: 'Classificada',
        boa: categoria({ pesoCaixa: 22, precoCaixa: 55, caixas: 10 }),
        fraca: categoria({ pesoCaixa: 20, precoCaixa: 30, caixas: 5 }),
      });

      const resultado = contas.recalcular([antiga, nova]);

      expect(resultado.boa.valorTotal).toBe(550);
      expect(resultado.fraca.valorTotal).toBe(150);
      expect(resultado.boa.precoQuilo).toBeCloseTo(2.5, 10);
      expect(resultado.valorTotal.valor).toBe(700);
      expect(resultado.valorTotal.pesos).toBe(320);
      expect(resultado.valorTotal.mediaCaixas).toBeCloseTo(700 / 15, 10);
    });

    /**
     * Aqui mora o erro que motivou este arquivo: no ramo do quilo da venda
     * classificada, o terceiro valor devolvido por quilo() é o preço da CAIXA,
     * e ele estava sendo gravado em precoQuilo. O total saía certo, mas o preço
     * por quilo guardado no histórico virava o preço da caixa.
     */
    it('venda classificada: pelo quilo, o preço do quilo continua sendo o digitado', () => {
      const antiga = venda({
        tipo: 'Classificada',
        boa: categoria({ pesoCaixa: 22, precoCaixa: 55, precoQuilo: 2.5, caixas: 10 }),
        fraca: categoria({ pesoCaixa: 20, precoCaixa: 30, precoQuilo: 1.5, caixas: 5 }),
      });
      const nova = venda({
        tipo: 'Classificada',
        boa: categoria({ pesoCaixa: 22, precoCaixa: 55, precoQuilo: 3, caixas: 10 }),
        fraca: categoria({ pesoCaixa: 20, precoCaixa: 30, precoQuilo: 2, caixas: 5 }),
      });

      const resultado = contas.recalcular([antiga, nova]);

      expect(resultado.boa.valorTotal).toBe(660);
      expect(resultado.fraca.valorTotal).toBe(200);

      expect(resultado.boa.precoQuilo).toBe(3);
      expect(resultado.fraca.precoQuilo).toBe(2);

      // e o preço da caixa é que passa a acompanhar
      expect(resultado.boa.precoCaixa).toBe(66);
      expect(resultado.fraca.precoCaixa).toBe(40);
    });
  });
});
