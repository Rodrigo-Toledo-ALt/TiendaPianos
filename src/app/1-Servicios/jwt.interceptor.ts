import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

// Variables de estado para el manejo de refresh token a nivel global
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

// Interceptor como función para cumplir con el enfoque Standalone
export const jwtInterceptor: HttpInterceptorFn = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // No añadir token para rutas de autenticación
  if (isAuthRequest(request)) {
    return next(request);
  }

  // Añadir token a la solicitud
  const token = authService.getToken();
  if (token) {
    request = addToken(request, token);
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(request, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

// Determinar si es una solicitud de autenticación
function isAuthRequest(request: HttpRequest<any>): boolean {
  const url = request.url.toLowerCase();
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/registro') ||
    url.includes('/auth/refresh')
  );
}

// Añadir el token Authorization al header
function addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

// Manejar errores 401 (No autorizado)
function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<any>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.attemptRefreshToken().pipe(
      switchMap((token) => {
        isRefreshing = false;
        refreshTokenSubject.next(token);
        return next(addToken(request, authService.getToken() || ''));
      }),
      catchError((error) => {
        isRefreshing = false;
        authService.logout();
        router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(addToken(request, authService.getToken() || ''));
      })
    );
  }
}