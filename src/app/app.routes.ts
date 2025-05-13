import { Routes } from '@angular/router';
import {CarritoComponent} from "./carrito/carrito.component";
import {ProductoComponent} from "./producto/producto.component";
import {LoginComponent} from "./login/login.component";
import {PerfilComponent} from "./perfil/perfil.component";
import {AuthGuard} from "./1-Servicios/auth.guard";



export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path:'carrito',
    component:CarritoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'producto/:id',
    component:ProductoComponent
  },
  {
    path: 'login',
    component:LoginComponent
  },
  // Ruta para el perfil (protegida con AuthGuard)
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [AuthGuard]
  },

];
