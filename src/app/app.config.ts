import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './1-Servicios/jwt.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      (req, next) => {
        // This is where the interceptor logic would go in the new style
        const jwtInterceptor = new JwtInterceptor(
          // Injector will handle this in the actual implementation
          // This is just a placeholder
          {} as any, 
          {} as any
        );
        return jwtInterceptor.intercept(req, next);
      }
    ])),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ]
};