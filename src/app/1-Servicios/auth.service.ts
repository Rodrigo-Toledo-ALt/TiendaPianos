import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private TOKEN_KEY = 'auth-token';
  private EXPIRATION_KEY = 'token-expiration';
  private USER_DATA_KEY = 'user-data';

  // BehaviorSubject para mantener el estado de autenticación y poder suscribirse a cambios
  private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());

  constructor(private router: Router) {
    // Verificar expiración del token al iniciar el servicio
    if (this.isTokenExpired()) {
      this.logout();
    }
  }

  // Guardar el token y su fecha de expiración
  setToken(token: string, expiration: number | null = null): void {
    if (token) {
      sessionStorage.setItem(this.TOKEN_KEY, token);

      if (expiration) {
        sessionStorage.setItem(this.EXPIRATION_KEY, expiration.toString());
      }

      // Notificar cambio de estado de autenticación
      this.authStatusSubject.next(true);
    }
  }

  // Obtener el token desde sessionStorage
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getToken();
    const expiration = this.getTokenExpiration();

    // Si no hay token o si el token ha expirado, retorna false
    if (!token || !expiration || Date.now() > expiration) {
      return false;
    }
    return true;
  }

  // Observable para suscribirse al estado de autenticación
  isLoggedIn(): Observable<boolean> {
    return this.authStatusSubject.asObservable();
  }

  // Cerrar sesión - eliminar token y datos de usuario
  logout(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.EXPIRATION_KEY);
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

  // Obtener la fecha de expiración del token
  private getTokenExpiration(): number | null {
    const expiration = sessionStorage.getItem(this.EXPIRATION_KEY);
    return expiration ? parseInt(expiration, 10) : null;
  }

  // Verificar si el token ha expirado
  private isTokenExpired(): boolean {
    const expiration = this.getTokenExpiration();
    return expiration !== null && Date.now() > expiration;
  }

}
