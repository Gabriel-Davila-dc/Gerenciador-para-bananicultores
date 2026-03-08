import { Injectable } from '@angular/core';
import { Venda } from '../models/venda';

@Injectable({
  providedIn: 'root',
})
export class Contas {
  caixa(peso: number, preco: number, quantidade: number): number[] {
    quantidade = quantidade ? quantidade : 1; //se n tiver quantidade, considera 1
    const valorTotal = preco * quantidade; // 💰 total em dinheiro
    const pesoTotal = peso * quantidade; // ⚖️ total em quilos
    const valorPorQuilo = valorTotal / pesoTotal; // 🧮 preço médio por quilo

    return [valorTotal, pesoTotal, valorPorQuilo];
  }
  quilo(peso: number, preco: number, quantidade: number): number[] {
    quantidade = quantidade ? quantidade : 1; //se n tiver quantidade, considera 1
    const valorTotal = preco * (quantidade * peso); // 💰 total em dinheiro
    const pesoTotal = peso * quantidade; // ⚖️ total em quilos
    const valorPorCaixa = preco * peso; // 🧮 preço médio por quilo

    return [valorTotal, pesoTotal, valorPorCaixa];
  }

  mediaCaixa(
    boa: number[],
    fraca: number[],
    quantidadeBoa: number,
    quantidadeFraca: number,
  ): number[] {
    const ValorTotal = boa[0] + fraca[0];
    const PesoTotal = boa[1] + fraca[1];
    const valorPorQuilo = ValorTotal / PesoTotal;
    const caixas = quantidadeBoa + quantidadeFraca;
    const valorPorCaixa = (ValorTotal / PesoTotal) * (PesoTotal / caixas);
    return [ValorTotal, PesoTotal, valorPorQuilo, valorPorCaixa];
  }
  mediaQuilo(
    boa: number[],
    fraca: number[],
    quantidadeBoa: number,
    quantidadeFraca: number,
  ): number[] {
    const ValorTotal = boa[0] + fraca[0];
    const PesoTotal = boa[1] + fraca[1];
    const valorPorQuilo = ValorTotal / PesoTotal;
    const caixas = quantidadeBoa + quantidadeFraca;
    const valorPorCaixa = (ValorTotal / PesoTotal) * (PesoTotal / caixas);

    return [ValorTotal, PesoTotal, valorPorCaixa, valorPorQuilo];
  }

  recalcular(venda: Venda[]) {
    const vendaAntiga = venda[0];
    const vendaNova = venda[1];
    console.log('venda contada quilo:', vendaNova);

    //   SIMPLES   //

    if (vendaNova.tipo === 'Simples') {
      //se mudou o da preço caixa, recalcular tudo com base no preço da caixa
      if (vendaAntiga.simples.precoCaixa !== vendaNova.simples.precoCaixa) {
        const resultado = this.caixa(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoCaixa,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.valorTotal.mediaQuilos = resultado[2];
        console.log('venda contada caixa:', vendaNova);
        return vendaNova;
      } else {
        const resultado = this.quilo(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoQuilo,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.valorTotal.mediaCaixas = resultado[2];
        console.log('venda contada quilo:', vendaNova);
        return vendaNova;
      }
    }
    //   CLASSIFICADA   //
    else {
      if (vendaAntiga.simples.precoCaixa !== vendaNova.simples.precoCaixa) {
        const resultado = this.caixa(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoCaixa,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.valorTotal.mediaQuilos = resultado[2];
        console.log('venda contada caixa:', vendaNova);
        return vendaNova;
      } else {
        const resultado = this.quilo(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoQuilo,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.valorTotal.mediaCaixas = resultado[2];
        console.log('venda contada quilo:', vendaNova);
        return vendaNova;
      }
    }
  }
}
