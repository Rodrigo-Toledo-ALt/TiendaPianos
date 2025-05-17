import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PedidoResponse, CrearPedidoRequest, ActualizarEstadoPedidoRequestDTO } from './models';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Endpoints para usuarios normales
  obtenerPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/pedidos`).pipe(
      catchError(error => {
        console.error('Error al obtener pedidos', error);
        return of([]);
      })
    );
  }

  obtenerPedidoPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/pedidos/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener pedido con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener PedidoPorID'));
      })
    );
  }

  crearPedido(pedido: CrearPedidoRequest): Observable<PedidoResponse> {
    return this.http.post<PedidoResponse>(`${this.apiUrl}/pedidos`, pedido).pipe(
      catchError(error => {
        console.error('Error al crear pedido', error);
        return throwError(() => new Error('Error al CrearPedido'));
      })
    );
  }

  // Endpoints para administradores
  obtenerTodosLosPedidos(): Observable<PedidoResponse[]> {
    return this.http.get<PedidoResponse[]>(`${this.apiUrl}/admin/pedidos`).pipe(
      catchError(error => {
        console.error('Error al obtener todos los pedidos', error);
        return of([]);
      })
    );
  }

  obtenerPedidoAdminPorId(id: number): Observable<PedidoResponse> {
    return this.http.get<PedidoResponse>(`${this.apiUrl}/admin/pedidos/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener pedido admin con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener PedidoAdminPorID'));
      })
    );
  }

  actualizarEstadoPedido(id: number, estado: ActualizarEstadoPedidoRequestDTO): Observable<PedidoResponse> {
    return this.http.put<PedidoResponse>(`${this.apiUrl}/admin/pedidos/${id}/estado`, estado).pipe(
      catchError(error => {
        console.error(`Error al actualizar estado del pedido ${id}`, error);
        return throwError(() => new Error('Error al obtener usuario'));
      })
    );
  }
}
