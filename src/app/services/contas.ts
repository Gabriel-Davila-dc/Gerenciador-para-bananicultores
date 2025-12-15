import { Injectable } from '@angular/core';

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

  mediaCaixa(boa: number[], fraca: number[]): number[] {
    const ValorTotal = boa[0] + fraca[0];
    const PesoTotal = boa[1] + fraca[1];
    const valorPorQuilo = ValorTotal / PesoTotal;

    return [ValorTotal, PesoTotal, valorPorQuilo];
  }
  mediaQuilo(
    boa: number[],
    fraca: number[],
    quantidadeBoa: number,
    quantidadeFraca: number
  ): number[] {
    const ValorTotal = boa[0] + fraca[0];
    const PesoTotal = boa[1] + fraca[1];
    const caixas = quantidadeBoa + quantidadeFraca;
    const valorPorQuilo = (ValorTotal / PesoTotal) * (PesoTotal / caixas);
    console.log(ValorTotal + '|' + PesoTotal + ' x ' + (PesoTotal + '|' + caixas));

    return [ValorTotal, PesoTotal, valorPorQuilo];
  }
}
