import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTokenInterceptor } from './app/1-Servicios/http-interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
    provideIonicAngular(),
    provideHttpClient(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
  ],
});
