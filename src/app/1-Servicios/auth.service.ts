import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { SesionService, JwtResponseDTO, RefreshTokenRequestDTO } from './sesion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'auth-token';
  private REFRESH_TOKEN_KEY = 'refresh-token';
  private USER_DATA_KEY = 'user-data';
  private apiUrl = 'http://localhost:8080/api';

  // BehaviorSubject para mantener el estado de autenticación y poder suscribirse a cambios
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());

  constructor(
    private router: Router,
    private http: HttpClient,
    private sesionService: SesionService
  ) {
    // Verificar expiración del token al iniciar el servicio
    if (this.isTokenExpired()) {
      this.logout();
    }

    // Configurar verificador periódico de token
    this.startTokenExpirationCheck();
  }

  // Guardar la respuesta JWT con tokens y datos de usuario
  setAuthData(response: JwtResponseDTO): void {
    if (response && response.token) {
      sessionStorage.setItem(this.TOKEN_KEY, response.token);
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);

      // Guardar los datos del usuario
      const userData = {
        id: response.id,
        nombre: response.nombre,
        email: response.email,
        rol: response.rol
      };

      this.setUserData(userData);

      // Notificar cambio de estado de autenticación
      this.authStatusSubject.next(true);
    }
  }

  // Obtener el token desde sessionStorage
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Obtener el refresh token
  getRefreshToken(): string | null {
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // Devuelve true si hay token, false si no
  }

  // Observable para suscribirse al estado de autenticación
  isLoggedIn(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  // Cerrar sesión - eliminar tokens y datos de usuario
  logout(): void {
    // No hay endpoint de logout en el API, así que solo limpiamos localmente
    this.clearStorageAndRedirect();
  }

  // Método auxiliar para limpiar el almacenamiento y redirigir
  private clearStorageAndRedirect(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(this.USER_DATA_KEY);

    // Notificar cambio de estado de autenticación
    this.authStatusSubject.next(false);

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  // Guardar datos adicionales del usuario
  setUserData(userData: any): void {
    if (userData) {
      sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));
    }
  }

  // Obtener datos del usuario
  getUserData(): any {
    const userData = sessionStorage.getItem(this.USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Obtener el rol del usuario actual
  getUserRole(): string {
    const userData = this.getUserData();
    return userData?.rol || 'guest';
  }

  // Verificar si el usuario tiene un rol específico
  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  // Los JWT tienen expiración incorporada que se valida en el servidor
  // Verificar si el token ha expirado solo puede hacerse aproximadamente en el cliente
  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    // JWT típicamente está en formato: header.payload.signature
    // Intentamos decodificar el payload
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp está en segundos, Date.now() en milisegundos
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      console.error('Error decodificando token JWT', e);
      return true; // Si hay error al decodificar, consideramos expirado
    }
  }

  // Verificar el perfil del usuario para validar el token
  verifyToken(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error('No token found'));
    }

    // Usar el endpoint de perfil de usuario para validar token
    return this.sesionService.getPerfilUsuario().pipe(
      tap(() => {
        // Perfil obtenido correctamente, token válido
        this.authStatusSubject.next(true);
      }),
      catchError(error => {
        console.error('Error validando token', error);
        if (error.status === 401) {
          // Intenta refresh token si hay 401
          return this.attemptRefreshToken();
        }
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Configurar verificador periódico de token
  private startTokenExpirationCheck(): void {
    // Verificar el token cada 5 minutos
    setInterval(() => {
      if (this.isAuthenticated() && this.isTokenExpired()) {
        // Si el token ha expirado, intentar refrescar
        this.attemptRefreshToken().subscribe();
      }
    }, 5 * 60 * 1000);
  }

  // Intentar refrescar el token
  attemptRefreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token found'));
    }

    return this.sesionService.refreshToken({ refreshToken }).pipe(
      tap(response => {
        // Guardar los nuevos tokens
        this.setAuthData(response);
      }),
      catchError(error => {
        console.error('Error refrescando token', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Login con credenciales
  login(email: string, contrasena: string): Observable<JwtResponseDTO> {
    return this.sesionService.login({ email, contrasena }).pipe(
      tap(response => {
        this.setAuthData(response);
      }),
      catchError(error => {
        // Extraer mensaje de error del backend
        let errorMessage = 'Error al iniciar sesión';

        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  // Registro de nuevo usuario
  registro(nombre: string, email: string, contrasena: string): Observable<JwtResponseDTO> {
    return this.sesionService.registro({ nombre, email, contrasena }).pipe(
      tap(response => {
        this.setAuthData(response);
      })
    );
  }

  // Verificar si usuario tiene rol de administrador
  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }
}
