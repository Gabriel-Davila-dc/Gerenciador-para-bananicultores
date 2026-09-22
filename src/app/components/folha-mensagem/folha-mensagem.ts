import { Component, Input } from '@angular/core';

/**
 * Mensagem curta desenhada sobre a folha de bananeira (public/img/folha.png).
 *
 * O espaço claro no centro da folha é pequeno: cabe bem uma frase curta tipo
 * "Nenhuma venda para esse filtro.". A fonte encolhe sozinha com a largura do
 * componente (unidades cqi), e mensagem longa demais para o espaço é cortada
 * com reticências em vez de estourar por cima do desenho da folha.
 */
@Component({
  selector: 'app-folha-mensagem',
  standalone: true,
  templateUrl: './folha-mensagem.html',
  styleUrl: './folha-mensagem.css',
})
export class FolhaMensagem {
  @Input() texto = '';
}
