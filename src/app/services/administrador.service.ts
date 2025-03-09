import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { TokenService } from './token.service';
import { CrearInsumoDTO } from '../interfaces/Insumo/crear-insumo-dto';
import { InsumoDTO } from '../interfaces/Insumo/insumo-dto';
import { EditarInsumoDTO } from '../interfaces/Insumo/editar-insumo-dto';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {


  private adminURL = "http://localhost:8080/api";


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
}
