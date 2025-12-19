import { Routes } from '@angular/router';
import { Calculadora } from './pages/calculadora/calculadora';
import { Gerenciador } from './pages/gerenciador/gerenciador';

export const routes: Routes = [
  {
    path: '',
    component: Calculadora,
  },
  {
    path: 'gerenciador',
    component: Gerenciador,
  },
];
