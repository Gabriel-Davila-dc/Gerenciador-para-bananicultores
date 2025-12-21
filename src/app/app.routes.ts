import { Routes } from '@angular/router';
import { Calculadora } from './pages/calculadora/calculadora';
import { Gerenciador } from './pages/gerenciador/gerenciador';
import { Sobre } from './pages/sobre/sobre';

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
];
