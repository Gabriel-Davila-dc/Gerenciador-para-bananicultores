import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3333';

  constructor(private http: HttpClient) {}

  getUser() {
    const userId = localStorage.getItem('userId');

    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }
}
