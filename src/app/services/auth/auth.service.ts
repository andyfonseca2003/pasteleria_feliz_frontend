import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrearCuentaDTO } from '../../interfaces/Cuenta/crear-cuenta-dto';
import { MensajeDTO } from '../../interfaces/mensaje-dto';
import { LoginDTO } from '../../interfaces/Cuenta/login-dto';
import { ActivarCuentaDTO } from '../../interfaces/Cuenta/activar-cuenta-dto';
import { recuperarDTO } from '../../interfaces/Cuenta/recuperar-cuenta-dto';


@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private authURL = "https://pasteleria-v6wz.onrender.com/api/auth";

  constructor(private http: HttpClient) { }

  public crearCuenta(cuentaDTO: CrearCuentaDTO): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.authURL}/crear-cuenta`, cuentaDTO);
  }

  public iniciarSesion(loginDTO: LoginDTO): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.authURL}/login`, loginDTO);
  }

  public activarCuenta(activarCuenta: ActivarCuentaDTO): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.authURL}/recuperar-contrasena`, activarCuenta);
  }

  public refreshToken(activarCuenta: ActivarCuentaDTO): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.authURL}/activar-cuenta`, activarCuenta);
  }

  public enviarCodigo(email: string): Observable<MensajeDTO> {
    const requestBody = { email: email }; // Crear objeto con la propiedad email
    return this.http.post<MensajeDTO>(`${this.authURL}/enviar-codigo`, requestBody);
  }
}
