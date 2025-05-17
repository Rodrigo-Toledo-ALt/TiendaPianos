import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsuarioDTO } from './models';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Endpoint para obtener perfil (cualquier usuario)
  obtenerPerfil(): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/usuarios/perfil`).pipe(
      catchError(error => {
        console.error('Error al obtener perfil', error);
        return throwError(() => new Error('Error al obtener perfil'));
      })
    );
  }

  // Endpoints para administradores
  obtenerTodosLosUsuarios(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(`${this.apiUrl}/admin/usuarios`).pipe(
      catchError(error => {
        console.error('Error al obtener todos los usuarios', error);
        return of([]);
      })
    );
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioDTO> {
    return this.http.get<UsuarioDTO>(`${this.apiUrl}/admin/usuarios/${id}`).pipe(
      catchError(error => {
        console.error(`Error al obtener usuario con ID ${id}`, error);
        return throwError(() => new Error('Error al obtener usuario'));
      })
    );
  }
}
