// user-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../1-Servicios/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UserDashboardComponent implements OnInit {
  hasOrders: boolean = false;
  currentUser: any = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener los datos del usuario
    this.currentUser = this.authService.getUserData();
  }

  explorePianos() {
    this.router.navigate(['/']);
  }

  changePassword() {
    // Implementar cambio de contraseña
    console.log('Cambiar contraseña para:', this.currentUser?.email);
  }

  updatePersonalInfo() {
    // Implementar actualización de información personal
    console.log('Actualizar información para:', this.currentUser?.name);
  }
}
