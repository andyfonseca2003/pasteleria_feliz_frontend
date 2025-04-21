import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';

@Injectable({
  providedIn: 'root'
})
export class RecetaService {
  private recetaURL = "http://localhost:8080/api/recipes";
  
  constructor(private http: HttpClient) { }

  public createReceta(receta: any): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.recetaURL}`, receta);
  }

  public updateReceta(id: number, receta: any): Observable<MensajeDTO> {
    return this.http.put<MensajeDTO>(`${this.recetaURL}/${id}`, receta);
  }

  public getReceta(id: number): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.recetaURL}/${id}`);
  }

  public deleteReceta(id: number): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.recetaURL}/${id}`);
  }

  public getAllRecetas(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.recetaURL}`);
  }

  public getPagedRecetas(
    page: number = 0, 
    size: number = 10, 
    sortField?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
    searchTerm?: string
  ): Observable<MensajeDTO> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortField && sortField.trim() !== '') {
      params = params.set('sort', sortField);
      params = params.set('direction', sortDirection);
    }
    
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<MensajeDTO>(`${this.recetaURL}/paged`, { params });
  }
}
