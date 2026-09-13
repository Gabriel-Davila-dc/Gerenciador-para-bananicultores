import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { CadastrosService, CHAVE_PADROES_DESCARTADOS, RECURSO_CADASTROS } from './cadastros-service';
import { CrmService, RECURSO_CRM } from './crm-service';
import { InvestimentosService, RECURSO_INVESTIMENTOS } from './investimentos-service';
import { Operacao, SincronizacaoService } from './sincronizacao-service';

/**
 * As telas abriam com exemplos que entravam na fila como criação do produtor.
 * Cada aparelho ou navegador novo mandava mais uma cópia para o servidor, e o
 * que a pessoa apagava voltava. Aqui fica garantido que o aparelho novo não
 * semeia nada, e que o aparelho antigo perde os exemplos que ainda não subiram
 * sem perder o que o produtor criou de verdade.
 */
describe('Nada entra na fila sem o produtor criar', () => {
  const fila = (): Operacao[] => JSON.parse(localStorage.getItem('fila-sincronizacao') ?? '[]');

  function operacao(recurso: string, idLocal: number, dados: object): Operacao {
    return { id: `op${recurso}${idLocal}`, recurso, tipo: 'criar', idLocal, dados };
  }

  function iniciar(): void {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient()],
    });
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  describe('aparelho novo', () => {
    beforeEach(iniciar);

    it('investimentos abre vazio e não enfileira nada', () => {
      expect(TestBed.inject(InvestimentosService).listar()).toEqual([]);
      expect(fila()).toEqual([]);
    });

    it('CRM abre vazio e não enfileira nada', () => {
      expect(TestBed.inject(CrmService).listar()).toEqual([]);
      expect(fila()).toEqual([]);
    });

    it('cadastros abre vazio e não enfileira nada', () => {
      const cadastros = TestBed.inject(CadastrosService);

      expect(cadastros.listar('bananais')).toEqual([]);
      expect(cadastros.listar('servicos')).toEqual([]);
      expect(cadastros.listar('trabalhadores')).toEqual([]);
      expect(fila()).toEqual([]);
    });

    it('o que o produtor cria continua indo para a fila', () => {
      TestBed.inject(CadastrosService).adicionar('bananais', 'Pedreira');

      expect(fila().map((op) => op.recurso)).toEqual([RECURSO_CADASTROS]);
    });
  });

  describe('aparelho que já tinha semeado os exemplos', () => {
    it('investimentos: tira os exemplos do cache e da fila, e fica o do produtor', () => {
      const exemplo = { id: -1, produto: 'Adubo NPK 20-05-20' };
      const botas = { id: -1789000000000, produto: 'Par de botas' };
      const jaSubiu = { id: 19, produto: 'Enxada' };

      localStorage.setItem('investimentos', JSON.stringify([exemplo, botas, jaSubiu]));
      localStorage.setItem(
        'fila-sincronizacao',
        JSON.stringify([
          operacao(RECURSO_INVESTIMENTOS, -1, exemplo),
          operacao(RECURSO_INVESTIMENTOS, botas.id, botas),
        ]),
      );

      iniciar();
      const lista = TestBed.inject(InvestimentosService).listar();

      expect(lista.map((item) => item.id)).toEqual([botas.id, 19]);
      expect(fila().map((op) => op.idLocal)).toEqual([botas.id]);
    });

    it('CRM: tira os exemplos do cache e da fila, e fica o do produtor', () => {
      const exemplo = { id: -3, servico: 'Combate à Sigatoka', diasPulados: [] };
      const desbrota = { id: -1789000000000, servico: 'Desbrota', diasPulados: [] };

      localStorage.setItem('servicos-crm', JSON.stringify([exemplo, desbrota]));
      localStorage.setItem(
        'fila-sincronizacao',
        JSON.stringify([
          operacao(RECURSO_CRM, -3, exemplo),
          { ...operacao(RECURSO_CRM, -3, exemplo), id: 'edicao', tipo: 'editar' },
          operacao(RECURSO_CRM, desbrota.id, desbrota),
        ]),
      );

      iniciar();
      const lista = TestBed.inject(CrmService).listar();

      expect(lista.map((item) => item.id)).toEqual([desbrota.id]);
      expect(fila().map((op) => op.idLocal)).toEqual([desbrota.id]);
    });

    it('cadastros: tira os padrões pendentes e deixa o que o produtor cadastrou', () => {
      const padrao = { id: -1789000000001, tipo: 'servicos', nome: 'Roçada' };
      const doProdutor = { id: -1789000000002, tipo: 'servicos', nome: 'Passar óleo' };
      const jaSubiu = { id: 40, tipo: 'bananais', nome: 'Bananal da Serra' };

      localStorage.setItem('cadastros-cache', JSON.stringify([padrao, doProdutor, jaSubiu]));
      localStorage.setItem(
        'fila-sincronizacao',
        JSON.stringify([
          operacao(RECURSO_CADASTROS, padrao.id, padrao),
          operacao(RECURSO_CADASTROS, doProdutor.id, doProdutor),
        ]),
      );

      iniciar();
      const cadastros = TestBed.inject(CadastrosService);

      expect(cadastros.listarNomes('servicos')).toEqual(['Passar óleo']);
      expect(cadastros.listarNomes('bananais')).toEqual(['Bananal da Serra']);
      expect(fila().map((op) => op.idLocal)).toEqual([doProdutor.id]);
    });

    it('cadastros: depois da limpeza, um nome igual ao padrão cadastrado pelo produtor fica', () => {
      localStorage.setItem(CHAVE_PADROES_DESCARTADOS, '1');
      const colheita = { id: -1789000000003, tipo: 'servicos', nome: 'Colheita' };

      localStorage.setItem('cadastros-cache', JSON.stringify([colheita]));
      localStorage.setItem(
        'fila-sincronizacao',
        JSON.stringify([operacao(RECURSO_CADASTROS, colheita.id, colheita)]),
      );

      iniciar();

      expect(TestBed.inject(CadastrosService).listarNomes('servicos')).toEqual(['Colheita']);
      expect(fila().length).toBe(1);
    });
  });

  it('descartarCriacoes só mexe no recurso pedido', () => {
    localStorage.setItem(
      'fila-sincronizacao',
      JSON.stringify([operacao(RECURSO_CRM, -1, {}), operacao('vendas', -1, {})]),
    );

    iniciar();
    const retirados = TestBed.inject(SincronizacaoService).descartarCriacoes(RECURSO_CRM, () => true);

    expect(retirados).toEqual([-1]);
    expect(fila().map((op) => op.recurso)).toEqual(['vendas']);
  });
});
