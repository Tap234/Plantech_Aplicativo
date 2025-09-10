import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Planta } from './planta.model';

@Injectable({
  providedIn: 'root'
})
export class PlantaService {
  private apiUrl = 'http://localhost:8080/api/plantas';

  constructor(private http: HttpClient) { }

  getPlantas(): Observable<Planta[]> {
    return this.http.get<Planta[]>(this.apiUrl);
  }

  getPlantaById(id: number): Observable<Planta> {
    return this.http.get<Planta>(`${this.apiUrl}/${id}`);
  }

  createPlanta(plantaData: { nome: string; descricao: string }): Observable<Planta> {
    return this.http.post<Planta>(this.apiUrl, plantaData);
  }

  updatePlanta(id: number, plantaData: { nome: string; descricao: string }): Observable<Planta> {
    return this.http.put<Planta>(`${this.apiUrl}/${id}`, plantaData);
  }

  deletePlanta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}