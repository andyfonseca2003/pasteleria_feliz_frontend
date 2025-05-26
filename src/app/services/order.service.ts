import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MensajeDTO } from '../interfaces/mensaje-dto';
import { CreateCakeOrderCommand } from '../interfaces/order/create-cake-order-command';
import { UpdateCakeOrderStatusCommand } from '../interfaces/order/update-cake-order-status-command';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiURL = "https://pasteleria-v6wz.onrender.com/api";

  constructor(private http: HttpClient) { }

  public createCakeOrder(command: CreateCakeOrderCommand): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.apiURL}/cake-orders`, command);
  }

  public updateCakeOrderStatus(id: number, command: UpdateCakeOrderStatusCommand): Observable<MensajeDTO> {
    return this.http.put<MensajeDTO>(`${this.apiURL}/cake-orders/${id}/status`, command);
  }

  public getCakeOrder(id: number): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.apiURL}/cake-orders/${id}`);
  }

  public deleteCakeOrder(id: number): Observable<MensajeDTO> {
    return this.http.delete<MensajeDTO>(`${this.apiURL}/cake-orders/${id}`);
  }

  public getAllCakeOrders(): Observable<MensajeDTO> {
    return this.http.get<MensajeDTO>(`${this.apiURL}/cake-orders`);
  }

  public getPagedCakeOrders(
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
  
    return this.http.get<MensajeDTO>(`${this.apiURL}/cake-orders/paged`, { params });
  }

  public checkInventoryForOrder(command: CreateCakeOrderCommand): Observable<MensajeDTO> {
    return this.http.post<MensajeDTO>(`${this.apiURL}/cake-orders/check-inventory`, command);
  }
}