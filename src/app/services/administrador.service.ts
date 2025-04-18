import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { CrearInsumoDTO } from '../interfaces/Insumo/crear-insumo-dto';
import { EditarInsumoDTO } from '../interfaces/Insumo/editar-insumo-dto';
import { CrearSupplierDTO } from '../interfaces/supplier/crear-supplier-dto';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private adminURL = "http://localhost:8080/api";

  constructor(private http: HttpClient) { }

  public crearInsumo(crearInsumoDTO: CrearInsumoDTO): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.adminURL}/supplies`, crearInsumoDTO);
  }

  public actualizarInsumo(editarInsumoDTO: EditarInsumoDTO): Observable<MensajeDTO> {
    return this.http.put<MensajeDTO>(`${this.adminURL}/supplies/${editarInsumoDTO.id}`, editarInsumoDTO);
  }

  public obtenerInsumo(id: string): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.adminURL}/supplies/${id}`);
  }

  public eliminarInsumo(id: string): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.adminURL}/supplies/${id}`);
  }

  public listarInsumos(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.adminURL}/supplies`);
  }

  public crearSupplier(crearSupplierDTO: CrearSupplierDTO): Observable<MensajeDTO> {
    const body = {
      name: crearSupplierDTO.name,
      supplierID: crearSupplierDTO.supplierID,
      address: crearSupplierDTO.address,
      phone: crearSupplierDTO.phone,
      email: crearSupplierDTO.email,
      status: "ACTIVO",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userModify: 1
    };

    return this.http.post<MensajeDTO>(`${this.adminURL}/suppliers`, body);
  }

  public listarSuppliers(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.adminURL}/suppliers`);
  }
  
  public eliminarSupplier(id: string): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.adminURL}/suppliers/${id}`);
  }

  public listarInsumosPaginados(
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
  
    return this.http.get<MensajeDTO>(`${this.adminURL}/supplies/paged`, { params });
  }
}