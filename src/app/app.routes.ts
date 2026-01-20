import { Routes } from '@angular/router';
import { Calculadora } from './pages/calculadora/calculadora';
import { Gerenciador } from './pages/gerenciador/gerenciador';
import { Sobre } from './pages/sobre/sobre';
import { LoginPage } from './pages/login-page/login-page';
import { RegisterPage } from './pages/register-page/register-page';

export const routes: Routes = [
  {
    path: '',
    component: Calculadora,
  },
  {
    path: 'gerenciador',
    component: Gerenciador,
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
