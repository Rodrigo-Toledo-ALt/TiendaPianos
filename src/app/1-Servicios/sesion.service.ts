import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Define la interfaz para el usuario de login
export interface LoginRequestDTO {
  email: string;
  contrasena: string;
}

// Define la interfaz para el usuario de registro
export interface RegistroRequestDTO {
  nombre: string;
  email: string;
  contrasena: string;
}

// Define la interfaz para el token de respuesta
export interface JwtResponseDTO {
  token: string;
  refreshToken: string;
  tipo: string; // Siempre es "Bearer"
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

// Define la interfaz para refrescar token
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private httpClient: HttpClient) { }

  // Este método sirve para loggear el usuario, devolverá un token que se guardará en sessionStorage
  login(credentials: LoginRequestDTO): Observable<JwtResponseDTO> {
    return this.httpClient.post<JwtResponseDTO>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(data => console.log('Login exitoso', data))
    );
  }

  // Este método registra usuarios nuevos
  registro(nuevoUsuario: RegistroRequestDTO): Observable<JwtResponseDTO> {
    return this.httpClient.post<JwtResponseDTO>(`${this.apiUrl}/auth/registro`, nuevoUsuario);
  }

  // Este método registra usuarios administradores (solo accesible por ADMIN)
  registroAdmin(nuevoAdmin: RegistroRequestDTO): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/auth/registro/admin`, nuevoAdmin);
  }
  
  // Este método refresca el token JWT
  refreshToken(request: RefreshTokenRequestDTO): Observable<JwtResponseDTO> {
    return this.httpClient.post<JwtResponseDTO>(`${this.apiUrl}/auth/refresh`, request);
  }

  // Este método obtiene el perfil del usuario actual
  getPerfilUsuario(): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/usuarios/perfil`);
  }
}
