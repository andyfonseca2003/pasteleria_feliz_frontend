import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private supplierURL = "http://localhost:8080/api/suppliers";
  
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

  public getPagedSuppliers(page: number = 0, size: number = 10): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.supplierURL}/paged?page=${page}&size=${size}`);
  }
}