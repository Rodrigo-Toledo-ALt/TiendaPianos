import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

// Define la interfaz para el usuario de login
export interface UsuarioLogin {
  username: string;
  password: string;
}

// Define la interfaz para el token de respuesta
export interface Token {
  token: string;
  expiration: number;
  message: string;
  userId: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class SesionService {

  constructor(private httpClient: HttpClient) { }

  // Este método sirve para loggear el usuario, devolverá un token que se guardará en sessionStorage
  // Por ahora simularemos la respuesta para pruebas
  PostLogin(usuarioLogeando: UsuarioLogin): Observable<Token> {
    // En un entorno real, esto se conectaría a tu API:
    // return this.httpClient.post<Token>('api/auth/login', usuarioLogeando);

    // Para pruebas, simulamos la respuesta:
    // Usando String.fromCharCode(64) para evitar el símbolo @ en el código
    const usuarios = [
      { username: 'admin' + String.fromCharCode(64) + 'adaggio.com', password: 'password', role: 'admin' },
      { username: 'user' + String.fromCharCode(64) + 'example.com', password: 'password', role: 'user' }
    ];

    const usuario = usuarios.find(
      u => u.username === usuarioLogeando.username && u.password === usuarioLogeando.password
    );

    if (usuario) {
      // Simulamos un token JWT y una fecha de expiración
      const now = new Date();
      const expirationDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas

      const tokenResponse: Token = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoidXNlciJ9',
        expiration: expirationDate.getTime(),
        message: 'Login exitoso',
        userId: '123456',
        username: usuario.username
      };

      return of(tokenResponse).pipe(
        delay(800), // Simular delay de red
        tap(data => console.log('Login simulado exitoso', data))
      );
    } else {
      // Simulamos un error de autenticación
      throw new Error('Usuario o contraseña incorrectos');
    }
  }

  // Este método puede usarse para registrar usuarios nuevos
  PostRegistro(usuarioNuevo: any): Observable<any> {
    // En un entorno real:
    // return this.httpClient.post<any>('api/auth/register', usuarioNuevo);

    // Para pruebas:
    return of({ success: true, message: 'Usuario registrado con éxito' }).pipe(delay(800));
  }

  // Este método puede usarse para resetear contraseñas
  PostResetPassword(email: string): Observable<any> {
    // En un entorno real:
    // return this.httpClient.post<any>('api/auth/reset-password', { email });

    // Para pruebas:
    return of({ success: true, message: 'Se ha enviado un correo para restablecer su contraseña' }).pipe(delay(800));
  }
}
