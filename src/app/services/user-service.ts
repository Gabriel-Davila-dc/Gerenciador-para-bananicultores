import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getUser(): boolean {
    try {
      // Verifica se o token é válido
      this.http.get('http://localhost:3333/users/token', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }
  //Login
  getUserLogin(email: string, password: string) {
    let dados = this.http.post<any>('http://localhost:3333/users/login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        console.log('token service:' + res.token);
      }),
    );

    return dados;
  }
  //Registrar
  postUserRegister(email: string, password: string) {
    let dados = this.http.post<any>('http://localhost:3333/users', { email, password });
    return dados;
  }
}
