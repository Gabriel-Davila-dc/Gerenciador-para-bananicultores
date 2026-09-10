import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginResponse, RegisterResponse } from '../Types/auth';

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
