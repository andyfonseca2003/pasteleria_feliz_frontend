import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { CreateUserCommandDto } from '../interfaces/user/create-user-command-dto';
import { UpdateUserCommandDto } from '../interfaces/user/update-user-command-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userURL = "http://localhost:8080/api/users";

  constructor(private http: HttpClient) { }

  createUser(command: CreateUserCommandDto): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(this.userURL, command);
  }


  getUser(id: number): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.userURL}/${id}`);
  }

  getUserBasicInfo(id: number): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.userURL}/${id}/basic-info`);
  }

  updateUser(id: number, command: UpdateUserCommandDto): Observable<MensajeDTO> {
    return this.http.put<MensajeDTO>(`${this.userURL}/${id}`, command);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.userURL}/${id}`);
  }

  getAllUsers(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(this.userURL);
  }
}