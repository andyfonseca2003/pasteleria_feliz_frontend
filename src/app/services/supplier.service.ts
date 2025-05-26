import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private supplierURL = "https://pasteleria-v6wz.onrender.com/api/suppliers";
  
  constructor(private http: HttpClient) { }

  public createSupplier(supplier: any): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.supplierURL}`, supplier);
  }

  public updateSupplier(id: number, supplier: any): Observable<MensajeDTO> {
    return this.http.put<MensajeDTO>(`${this.supplierURL}/${id}`, supplier);
  }

  public getSupplier(id: number): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.supplierURL}/${id}`);
  }

  public deleteSupplier(id: number): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.supplierURL}/${id}`);
  }

  public getAllSuppliers(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.supplierURL}`);
  }

  public getPagedSuppliers(
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

    return this.http.get<MensajeDTO>(`${this.supplierURL}/paged`, { params });
  }
}