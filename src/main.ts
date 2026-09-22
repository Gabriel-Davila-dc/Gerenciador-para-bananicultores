import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { routes } from './app/app.routes';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

/**
 * O navegador muda o valor de <input type="number"> focado ao girar a roda do
 * mouse por cima dele — no computador, rolar a tela numa dessas telas troca o
 * número em vez de descer a página. Tira o foco assim que a rolagem começa;
 * o resto do gesto rola a página normalmente, como em qualquer outro campo.
 */
document.addEventListener(
  'wheel',
  (evento) => {
    const alvo = evento.target;

    if (
      alvo instanceof HTMLInputElement &&
      alvo.type === 'number' &&
      document.activeElement === alvo
    ) {
      alvo.blur();
    }
  },
  { passive: true },
);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
