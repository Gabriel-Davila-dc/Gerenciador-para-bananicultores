import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

/**
 * Página de conteúdo, sem estado.
 *
 * Os painéis usam <details> nativo em vez de mat-expansion-panel: abrem e
 * fecham sem JavaScript, seguem acessíveis por teclado e deixam o visual
 * inteiro no CSS. Com isso a tela deixou de depender de seis módulos do
 * Material só para exibir texto.
 */
@Component({
  selector: 'app-sobre',
  imports: [RouterModule],
  templateUrl: './sobre.html',
  styleUrl: './sobre.css',
})
export class Sobre implements OnInit, OnDestroy {
  private inscricao?: Subscription;

  constructor(private rota: ActivatedRoute) {}

  /**
   * Rola até a seção do índice.
   *
   * Duas tentativas anteriores não funcionaram:
   *
   * 1. <a href="#secao"> comum. O index.html declara <base href="/">, e o
   *    navegador resolve o fragmento contra o base, não contra a URL atual:
   *    o link virava "/#secao" e levava para o início.
   *
   * 2. withInMemoryScrolling({ anchorScrolling: 'enabled' }). A URL passava a
   *    mudar certo, mas a rolagem não acontecia.
   *
   * Aqui a rolagem é explícita e não depende do Router: vale tanto para o
   * clique no índice quanto para quem abre /sobre#bananal direto no navegador.
   */
  ngOnInit(): void {
    this.inscricao = this.rota.fragment.subscribe((id) => this.rolarAte(id));
  }

  ngOnDestroy(): void {
    this.inscricao?.unsubscribe();
  }

  private rolarAte(id: string | null): void {
    if (!id) {
      return;
    }

    // o elemento pode ainda não estar no DOM no mesmo tique da navegação,
    // principalmente quando a página é aberta direto pela URL com fragmento
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}
