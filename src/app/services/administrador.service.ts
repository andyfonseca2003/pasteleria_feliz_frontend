import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {


  private adminURL = "http://localhost:8080/api";


  constructor(private http: HttpClient, private tokenService: TokenService) { }
 
  // public crearInsumo(crearInsumoDTO: CrearInsumoDTO): Observable<MensajeDTO> {
  //   return this.http.post<MensajeDTO>(`${this.adminURL}/supplies/crear`, crearInsumoDTO);
  // }
 
  // public actualizarInsumo(editarInsumoDTO: EditarInsumoDTO): Observable<MensajeDTO> {
  //   return this.http.put<MensajeDTO>(`${this.adminURL}/supplies/editar`, editarInsumoDTO);
  // }
 
 
  public obtenerInsumo(id: string): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.adminURL}/supplies/obtener/${id}`);
  }
 
 
  public eliminarInsumo(id: string): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.adminURL}/supplies/eliminar/${id}`);
  }
  

   
  // public listarTipoInsumos(): Observable<MensajeDTO> {
  //   return this.http.get<MensajeDTO>(`${this.adminURL}/supplies/obtener-tipos`);
  // }

  public listarInsumos(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.adminURL}/supplies`);
  }
}
