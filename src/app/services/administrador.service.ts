import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { TokenService } from './token.service';
import { CrearInsumoDTO } from '../interfaces/Insumo/crear-insumo-dto';
import { InsumoDTO } from '../interfaces/Insumo/insumo-dto';
import { EditarInsumoDTO } from '../interfaces/Insumo/editar-insumo-dto';
import {CrearSupplierDTO} from '../interfaces/supplier/crear-supplier-dto';
import {SupplierDTO} from '../interfaces/supplier/supplier-dto';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {


  private adminURL = "https://ing-soft-iii-pasteleria.onrender.com/api";


  constructor(private http: HttpClient, private tokenService: TokenService) { }

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

  public listarInsumos(): Observable<InsumoDTO[]> {
    return this.http.get<InsumoDTO[]>(`${this.adminURL}/supplies`);
  }

  // Método corregido para crear supplier
  public crearSupplier(crearSupplierDTO: CrearSupplierDTO): Observable<SupplierDTO> {
    const body = {
      name: crearSupplierDTO.name,
      supplierID: crearSupplierDTO.supplierID, // Asegúrate que coincida con el backend
      address: crearSupplierDTO.address,
      phone: crearSupplierDTO.phone,
      email: crearSupplierDTO.email,
      status: "ACTIVO", // Valor por defecto
      createdAt: new Date().toISOString(), // Obligatorio
      updatedAt: new Date().toISOString(), // Obligatorio
      userModify: 1 // ID de usuario (ajustar según tu auth)
    };

    return this.http.post<SupplierDTO>(`${this.adminURL}/suppliers`, body);
  }

// Método para listar suppliers
  public listarSuppliers(): Observable<SupplierDTO[]> {
    return this.http.get<SupplierDTO[]>(`${this.adminURL}/suppliers`);
  }
  public eliminarSupplier(id: string): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.adminURL}/suppliers/${id}`);
  }
}
