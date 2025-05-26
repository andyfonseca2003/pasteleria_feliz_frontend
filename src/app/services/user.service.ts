import { Injectable } from '@angular/core';
import { HttpClient, HttpParams  } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { CreateUserCommandDto } from '../interfaces/user/create-user-command-dto';
import { UpdateUserCommandDto } from '../interfaces/user/update-user-command-dto';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userURL = "https://pasteleria-v6wz.onrender.com/api/users";

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

  public getPagedUsers(
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

    return this.http.get<MensajeDTO>(`${this.userURL}/paged`, { params });
  }
}