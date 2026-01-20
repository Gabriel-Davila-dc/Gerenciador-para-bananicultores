import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getUserById() {
    const userId = localStorage.getItem('userId');

    return this.http.get(`${this.apiUrl}/users/${userId}`);
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
