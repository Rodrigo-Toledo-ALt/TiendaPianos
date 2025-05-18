// perfil.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  logOutOutline,
  bagOutline,
  musicalNotesOutline,
  addCircleOutline,
  createOutline,
  trashOutline
} from 'ionicons/icons';
import { AuthService } from '../1-Servicios/auth.service';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    UserDashboardComponent,
    AdminDashboardComponent
  ]
})
export class PerfilComponent implements OnInit {
  currentUser: any = null;
  isAdmin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    addIcons({
      'log-out-outline': logOutOutline,
      'shopping-bag-outline': bagOutline,
      'musical-notes-outline': musicalNotesOutline,
      'add-circle-outline': addCircleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline
    });




    // Obtener los datos del usuario de sessionStorage
    this.currentUser = this.authService.getUserData();

    //Esto hay que ver cómo se desarolla
    if (!this.currentUser) {
      // Este caso no debería ocurrir si el login guarda los datos correctamente
      // Pero es una buena práctica tener una solución de respaldo
      this.currentUser = {
        nombre: 'Usuario',
        email: 'usuario@adaggio.com',
        rol: 'user'
      };
    }
    // Determinar si el usuario es administrador
    this.isAdmin = this.currentUser && this.currentUser.rol === 'admin';





    // Comprobar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }


  }

  handleLogout() {
    this.authService.logout();
    // No necesitamos navegar aquí, ya que el método logout ya incluye la navegación
  }
}
