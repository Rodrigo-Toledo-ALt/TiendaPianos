import { Routes } from '@angular/router';
import { CarritoComponent } from "./carrito/carrito.component";
import { ProductoComponent } from "./producto/producto.component";
import { LoginComponent } from "./login/login.component";
import { PerfilComponent } from "./perfil/perfil.component";
import { AuthGuard } from "./1-Servicios/auth.guard";
import { RegistroComponent } from "./registro/registro.component";
import { AdminDashboardComponent } from "./perfil/admin-dashboard/admin-dashboard.component";
import { UserDashboardComponent } from "./perfil/user-dashboard/user-dashboard.component";
import { PianoFormComponent } from "./perfil/admin-dashboard/piano-form/piano-form.component";

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
    path: 'carrito',
    component: CarritoComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'producto/:id',
    component: ProductoComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'registro',
    component: RegistroComponent
  },
  // Backward compatibility route
  {
    path: 'registrocuenta',
    redirectTo: 'registro',
    pathMatch: 'full'
  },
  // Ruta para el perfil (protegida con AuthGuard)
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [AuthGuard],
        data: { requiredRole: 'admin' },
        children: [
          {
            path: 'piano-form',
            component: PianoFormComponent
          },
          {
            path: 'piano-form/:id',
            component: PianoFormComponent
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./perfil/admin-dashboard/usuarios/usuarios.component').then(m => m.UsuariosComponent)
          },
          {
            path: 'usuarios',
            loadComponent: () => import('./perfil/admin-dashboard/usuarios/usuarios.component').then(m => m.UsuariosComponent)
          },
          {
            path: 'pedidos',
            loadComponent: () => import('./perfil/admin-dashboard/pedidos/pedidos.component').then(m => m.PedidosComponent)
          }
        ]
      },
      {
        path: 'dashboard',
        component: UserDashboardComponent
      }
    ]
  },
];
