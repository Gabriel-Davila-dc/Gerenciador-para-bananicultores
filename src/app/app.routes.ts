import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

/**
 * Cada tela é carregada só quando alguém entra nela.
 *
 * Com os componentes importados de cima, o primeiro acesso baixava o app
 * inteiro — inclusive o drag-and-drop do CDK, que só o quadro do CRM usa, e as
 * seis telas do Gerenciador, que nem aparecem para quem não fez login. Numa
 * conexão de roça isso é espera pura antes da primeira conta.
 *
 * O import dinâmico é o que faz o Angular separar cada tela em um arquivo
 * próprio. Trocar por import de cima volta a juntar tudo no bundle inicial.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/calculadora/calculadora').then((m) => m.Calculadora),
  },
  {
    path: 'gerenciador',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/gerenciador/gerenciador').then((m) => m.Gerenciador),
      },
      {
        path: 'historico',
        loadComponent: () => import('./pages/historico/historico').then((m) => m.Historico),
      },
      {
        path: 'crm',
        loadComponent: () => import('./pages/crm/crm').then((m) => m.Crm),
      },
      {
        path: 'cadastros',
        loadComponent: () => import('./pages/cadastros/cadastros').then((m) => m.Cadastros),
      },
      {
        path: 'investimentos',
        loadComponent: () =>
          import('./pages/investimentos/investimentos').then((m) => m.Investimentos),
      },
      {
        path: 'metricas',
        loadComponent: () => import('./pages/metricas/metricas').then((m) => m.Metricas),
      },
      {
        path: 'compradores',
        loadComponent: () =>
          import('./pages/compradores/compradores').then((m) => m.Compradores),
      },
    ],
  },
  {
    path: 'sobre',
    loadComponent: () => import('./pages/sobre/sobre').then((m) => m.Sobre),
  },
  // entrar e criar conta são a mesma tela: o modo diz com qual das duas ela
  // abre, e o painel desliza de um lado para o outro na troca
  {
    path: 'login',
    data: { modo: 'entrar' },
    loadComponent: () => import('./pages/conta/conta').then((m) => m.Conta),
  },
  {
    path: 'esqueci-senha',
    loadComponent: () =>
      import('./pages/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenha),
  },
  {
    path: 'register',
    data: { modo: 'criar' },
    loadComponent: () => import('./pages/conta/conta').then((m) => m.Conta),
  },
];
