import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
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


  // Cambiar el estado de un usuario (activo/inactivo)
  cambiarEstadoUsuario(id: number, estado: string): Observable<UsuarioDTO> {
    const usuarioDTO: Partial<UsuarioDTO> = { estado };

    return this.http.put<UsuarioDTO>(`${this.apiUrl}/admin/usuarios/${id}/estado`, usuarioDTO).pipe(
      tap(usuario => console.log(`Estado de usuario ${id} actualizado a: ${estado}`)),
      catchError(error => {
        console.error(`Error al cambiar estado del usuario ${id}`, error);
        return throwError(() => new Error('Error al cambiar estado del usuario'));
      })
    );
  }

  // Actualizar información de un usuario
  // Método actualizado para incluir todos los campos
  actualizarUsuario(
    id: number,
    nombre: string,
    email: string,
    rol?: string,
    estado?: string
  ): Observable<UsuarioDTO> {
    const usuarioDTO: Partial<UsuarioDTO> = {
      nombre,
      email
    };

    // Añadir campos opcionales solo si se proporcionan
    if (rol !== undefined) {
      usuarioDTO.rol = rol;
    }

    if (estado !== undefined) {
      usuarioDTO.estado = estado;
    }

    return this.http.put<UsuarioDTO>(`${this.apiUrl}/admin/usuarios/${id}`, usuarioDTO).pipe(
      tap(usuario => console.log(`Usuario ${id} actualizado correctamente`)),
      catchError(error => {
        console.error(`Error al actualizar usuario ${id}`, error);
        return throwError(() => new Error('Error al actualizar usuario: ' + (error.error?.message || error.message || 'Error desconocido')));
      })
    );
  }

  // Método para simplificar el cambio de estado a inactivo/activo
  toggleEstadoUsuario(usuario: UsuarioDTO): Observable<UsuarioDTO> {
    // Si el usuario está activo, lo cambia a inactivo y viceversa
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    return this.cambiarEstadoUsuario(usuario.id, nuevoEstado);
  }
}
