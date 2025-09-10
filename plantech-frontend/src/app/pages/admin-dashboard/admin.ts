import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin/users';

  constructor(private http: HttpClient) { }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  promoteUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/promote`, {});
  }

  demoteUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/demote`, {});
  }
}