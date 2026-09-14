import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { EsqueciSenhaResponse, LoginResponse, RegisterResponse } from '../Types/auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  //Ver se está conectado -----------------------------------------------------------------------
  async getUser(): Promise<boolean> {
    try {
      await firstValueFrom(this.http.get(`${this.apiUrl}/users/token`));
      return true;
    } catch (error) {
      return false;
    }
  }
  //Login--------------------------------------------------------------------------------------
  getUserLogin(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/users/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('email', res.email);
      }),
    );
  }
  //Registrar------------------------------------------------------------------------------------
  postUserRegister(email: string, password: string) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/users`, { email, password });
  }
  //Esqueci minha senha - pede o codigo de 6 digitos por e-mail-----------------------------------
  /**
   * A API responde a mesma coisa com e sem cadastro, de proposito: a tela nao
   * tem como saber se o e-mail existe, e nao deve fingir que sabe.
   */
  postEsqueciSenha(email: string) {
    return this.http.post<EsqueciSenhaResponse>(`${this.apiUrl}/users/esqueci-senha`, { email });
  }
  //Redefinir a senha com o codigo recebido---------------------------------------------------------
  /**
   * Em caso de acerto a API ja devolve um token novo, entao a pessoa entra
   * direto, sem passar pela tela de login outra vez. Guarda igual ao login.
   */
  postRedefinirSenha(email: string, codigo: string, password: string) {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/users/redefinir-senha`, { email, codigo, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('email', res.email);
        }),
      );
  }
  //Logout---------------------------------------------------------------------------------------
  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${this.apiUrl}/users/logout`, {}));
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('email');
    }
  }
}
