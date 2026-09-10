import { Routes } from '@angular/router';
import { Calculadora } from './pages/calculadora/calculadora';
import { Gerenciador } from './pages/gerenciador/gerenciador';
import { Historico } from './pages/historico/historico';
import { Crm } from './pages/crm/crm';
import { Cadastros } from './pages/cadastros/cadastros';
import { Investimentos } from './pages/investimentos/investimentos';
import { Metricas } from './pages/metricas/metricas';
import { Compradores } from './pages/compradores/compradores';
import { Sobre } from './pages/sobre/sobre';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';
import { authGuard } from './guards/auth-guard';
export const routes: Routes = [
  {
    path: '',
    component: Calculadora,
  },
  {
    path: 'gerenciador',
    canActivate: [authGuard],
    children: [
      { path: '', component: Gerenciador },
      { path: 'historico', component: Historico },
      { path: 'crm', component: Crm },
      { path: 'cadastros', component: Cadastros },
      { path: 'investimentos', component: Investimentos },
      { path: 'metricas', component: Metricas },
      { path: 'compradores', component: Compradores },
    ],
  },
  {
    path: 'sobre',
    component: Sobre,
  },
  {
    path: 'login',
    component: LoginPage,
  },
  {
    path: 'register',
    component: RegisterPage,
  },
];
