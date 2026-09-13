import { Injectable } from '@angular/core';
import { ServicoCrm } from '../models/servico-crm';
import type { TipoCadastro } from './cadastros-service';
import { SincronizacaoService } from './sincronizacao-service';
import { ServicosApi } from './servicos-api';

export const RECURSO_CRM = 'crm';

const CHAVE = 'servicos-crm';

/**
 * O quadro abria com 4 serviços de exemplo, e eles entravam na fila como se o
 * produtor tivesse criado: cada aparelho ou navegador novo mandava mais uma
 * cópia para o servidor. Os exemplos tinham estes ids fixos, e criação de
 * verdade usa -Date.now(), então dá para achar os que ainda não subiram sem
 * levar registro real junto.
 */
export const IDS_EXEMPLOS_ANTIGOS = [-1, -2, -3, -4];

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  constructor(
    private sincronizacao: SincronizacaoService,
    private api: ServicosApi,
  ) {
    this.descartarExemplosAntigos();

    this.sincronizacao.registrar(RECURSO_CRM, {
      criar: (dados) => this.api.criar(dados as ServicoCrm),
      editar: (dados) => this.api.editar(dados as ServicoCrm),
      apagar: (id) => this.api.apagar(id),
      aoTrocarId: (idLocal, idServidor) => this.trocarId(idLocal, idServidor),
    });
  }

  // busca no servidor e junta com o que ainda está na fila
  async carregarDoServidor(): Promise<void> {
    await this.sincronizacao.sincronizar();

    try {
      const doServidor = await this.api.listar();
      this.guardar(this.sincronizacao.mesclar(RECURSO_CRM, this.listar(), doServidor));
    } catch {
      // sem servidor: segue com o cache do aparelho
    }
  }

  private trocarId(idLocal: number, idServidor: number): void {
    const servicos = this.listar();
    const servico = servicos.find((item) => item.id === idLocal);

    if (servico) {
      servico.id = idServidor;
      this.guardar(servicos);
    }
  }

  listar(): ServicoCrm[] {
    const salvos = localStorage.getItem(CHAVE);

    // sem nada salvo o quadro abre vazio: só entra na fila o que o produtor criou
    if (!salvos) {
      return [];
    }

    // quem já tinha serviço salvo antes dos dias pulados existirem traz o
    // campo ausente; sem o [] aqui, todo uso adiante quebraria no undefined
    return (JSON.parse(salvos) as ServicoCrm[]).map((servico) => ({
      ...servico,
      diasPulados: servico.diasPulados ?? [],
    }));
  }

  salvar(servico: ServicoCrm): void {
    const servicos = this.listar();
    const index = servicos.findIndex((s) => s.id === servico.id);

    if (index === -1) {
      // negativo, como nas vendas: não colide com id de servidor
      servico.id = -Date.now();
      servicos.push(servico);
      this.sincronizacao.enfileirar(RECURSO_CRM, 'criar', servico.id, servico);
    } else {
      servicos[index] = servico;
      this.registrarEdicao(servico);
    }

    this.guardar(servicos);
  }

  // usado quando o card muda de etapa pelo arrastar, sem passar pelo formulário
  registrarEdicao(servico: ServicoCrm): void {
    const criacao = this.sincronizacao.criacaoPendente(RECURSO_CRM, servico.id);

    if (criacao) {
      // ainda não existe no servidor: atualiza o conteúdo da criação pendente
      this.sincronizacao.atualizarDados(criacao.id, servico);
    } else {
      this.sincronizacao.enfileirar(RECURSO_CRM, 'editar', servico.id, servico);
    }
  }

  apagar(id: number): void {
    this.guardar(this.listar().filter((s) => s.id !== id));

    const naoEnviado = !!this.sincronizacao.criacaoPendente(RECURSO_CRM, id);
    this.sincronizacao.removerDoRegistro(RECURSO_CRM, id);

    if (!naoEnviado) {
      this.sincronizacao.enfileirar(RECURSO_CRM, 'apagar', id);
    }
  }

  // usado quando o card é arrastado de uma coluna pra outra
  guardarTodos(servicos: ServicoCrm[]): void {
    this.guardar(servicos);
  }

  // quando um item do cadastro é renomeado, os serviços que já usavam o nome
  // antigo precisam acompanhar, senão ficariam apontando pra algo que sumiu
  atualizarReferencia(tipo: TipoCadastro, antigo: string, novo: string): void {
    const campo: keyof ServicoCrm =
      tipo === 'bananais' ? 'bananal' : tipo === 'servicos' ? 'servico' : 'responsavel';

    const servicos = this.listar();
    let mudou = false;

    servicos.forEach((servico) => {
      if (servico[campo] === antigo) {
        (servico[campo] as string) = novo;
        mudou = true;
      }
    });

    if (mudou) {
      this.guardar(servicos);
    }
  }

  // o aparelho que já abriu o quadro guarda os exemplos no cache e, se não
  // sincronizou, também na fila; os dois lugares precisam perdê-los
  private descartarExemplosAntigos(): void {
    this.sincronizacao.descartarCriacoes(RECURSO_CRM, (op) =>
      IDS_EXEMPLOS_ANTIGOS.includes(op.idLocal),
    );

    const servicos = this.listar();
    const semExemplos = servicos.filter((item) => !IDS_EXEMPLOS_ANTIGOS.includes(item.id));

    if (semExemplos.length !== servicos.length) {
      this.guardar(semExemplos);
    }
  }

  private guardar(servicos: ServicoCrm[]): void {
    localStorage.setItem(CHAVE, JSON.stringify(servicos));
  }
}
