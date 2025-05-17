// app.module.ts
import { bootstrapApplication } from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import {HttpTokenInterceptor} from "./1-Servicios/http-interceptor";

// Remover toda la parte de NgModule
bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    // Agrega aquí tus demás providers
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true }
  ]
}).catch(err => console.error(err));
