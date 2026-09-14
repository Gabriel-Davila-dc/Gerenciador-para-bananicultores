import { Component } from '@angular/core';

/**
 * A metade esquerda das telas de conta, no computador: o bananal com o nome do
 * app e o que ele faz.
 *
 * Componente em vez de HTML copiado nas três telas (entrar, criar conta e
 * esqueci a senha) porque o texto é o mesmo nas três — quando estava copiado,
 * mexer numa deixava as outras para trás.
 */
@Component({
  selector: 'app-vitrine-conta',
  imports: [],
  templateUrl: './vitrine-conta.html',
  styleUrl: './vitrine-conta.css',
})
export class VitrineConta {}
