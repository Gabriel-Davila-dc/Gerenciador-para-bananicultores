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
      //if (vendaAntiga.simples.precoCaixa !== vendaNova.simples.precoCaixa) {
      if (true) {
        const resultado = this.caixa(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoCaixa,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.simples.valorTotal = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.simples.pesoTotal = resultado[1];
        vendaNova.valorTotal.mediaQuilos = resultado[2];
        vendaNova.simples.precoQuilo = resultado[2];
        console.log('venda contada caixa simples:', vendaNova);
        return vendaNova;
      }
      //SE QUILO, recalcular tudo com base no preço do quilo
      else {
        const resultado = this.quilo(
          vendaNova.simples.pesoCaixa,
          vendaNova.simples.precoQuilo,
          vendaNova.simples.caixas,
        );
        vendaNova.valorTotal.valor = resultado[0];
        vendaNova.simples.valorTotal = resultado[0];
        vendaNova.valorTotal.pesos = resultado[1];
        vendaNova.simples.pesoTotal = resultado[1];
        vendaNova.valorTotal.mediaCaixas = resultado[2];
        vendaNova.simples.precoCaixa = resultado[2];
        console.log('venda contada quilo simples:', vendaNova);
        return vendaNova;
      }
    }
    //   CLASSIFICADA   //
    else {
      if (true) {
        //Vou deixar aqui como TRUE por que ainda não encontrei um jeito de calcular qual dos dois tipos de preço foi alterado, então por enquanto, toda vez que for classificada, vai recalcular como se fosse o preço da caixa que tivesse sido alterado, mas isso pode ser melhorado no futuro, mas o else está como deveria funcionar caso consiga.
        //boa
        const resultadoBC = this.caixa(
          vendaNova.boa.pesoCaixa,
          vendaNova.boa.precoCaixa,
          vendaNova.boa.caixas,
        );
        vendaNova.boa.valorTotal = resultadoBC[0];
        vendaNova.boa.pesoTotal = resultadoBC[1];
        vendaNova.boa.precoQuilo = resultadoBC[2];

        //fraca
        const resultadoFC = this.caixa(
          vendaNova.fraca.pesoCaixa,
          vendaNova.fraca.precoCaixa,
          vendaNova.fraca.caixas,
        );
        vendaNova.fraca.valorTotal = resultadoFC[0];
        vendaNova.fraca.pesoTotal = resultadoFC[1];
        vendaNova.fraca.precoQuilo = resultadoFC[2];

        //media
        const ValorTotal = vendaNova.boa.valorTotal + vendaNova.fraca.valorTotal;
        const PesoTotal = vendaNova.boa.pesoTotal + vendaNova.fraca.pesoTotal;
        const valorPorQuilo = ValorTotal / PesoTotal;
        const caixas = vendaNova.boa.caixas + vendaNova.fraca.caixas;
        const valorPorCaixa = (ValorTotal / PesoTotal) * (PesoTotal / caixas);
        vendaNova.valorTotal.valor = ValorTotal;
        vendaNova.valorTotal.pesos = PesoTotal;
        vendaNova.valorTotal.mediaQuilos = valorPorQuilo;
        vendaNova.valorTotal.mediaCaixas = valorPorCaixa;
        console.log('venda contada caixa classificada:', vendaNova);
        return vendaNova;
      }
      //SE QUILO, recalcular tudo com base no preço do quilo
      else {
        //boa
        const resultadoBC = this.quilo(
          vendaNova.boa.pesoCaixa,
          vendaNova.boa.precoQuilo,
          vendaNova.boa.caixas,
        );
        vendaNova.boa.valorTotal = resultadoBC[0];
        vendaNova.boa.pesoTotal = resultadoBC[1];
        vendaNova.boa.precoQuilo = resultadoBC[2];

        //fraca
        const resultadoFC = this.quilo(
          vendaNova.fraca.pesoCaixa,
          vendaNova.fraca.precoQuilo,
          vendaNova.fraca.caixas,
        );
        vendaNova.fraca.valorTotal = resultadoFC[0];
        vendaNova.fraca.pesoTotal = resultadoFC[1];
        vendaNova.fraca.precoQuilo = resultadoFC[2];

        //media
        const ValorTotal = vendaNova.boa.valorTotal + vendaNova.fraca.valorTotal;
        const PesoTotal = vendaNova.boa.pesoTotal + vendaNova.fraca.pesoTotal;
        const valorPorQuilo = ValorTotal / PesoTotal;
        const caixas = vendaNova.boa.caixas + vendaNova.fraca.caixas;
        const valorPorCaixa = (ValorTotal / PesoTotal) * (PesoTotal / caixas);
        vendaNova.valorTotal.valor = ValorTotal;
        vendaNova.valorTotal.pesos = PesoTotal;
        vendaNova.valorTotal.mediaQuilos = valorPorQuilo;
        vendaNova.valorTotal.mediaCaixas = valorPorCaixa;
        console.log('venda contada quilo classificada:', vendaNova);
        return vendaNova;
      }
    }
  }
}
