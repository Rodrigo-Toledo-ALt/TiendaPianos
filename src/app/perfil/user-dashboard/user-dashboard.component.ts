import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../1-Servicios/auth.service';
import { PedidoService } from '../../1-Servicios/pedido.service';
import { UserFormComponent } from '../admin-dashboard/user-form/user-form.component';
import { PedidoResponse, UsuarioDTO } from '../../1-Servicios/models';
import { finalize } from 'rxjs/operators';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  closeOutline,
  refreshOutline,
  bagOutline,
  musicalNotesOutline,
  chevronDownOutline,
  chevronUpOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, UserFormComponent]
})
export class UserDashboardComponent implements OnInit {
  hasOrders: boolean = false;
  userOrders: PedidoResponse[] = [];
  currentUser: any = null;
  isLoading: boolean = false;
  error: string = '';

  // Para controlar la visualización de detalles
  expandedOrderId: number | null = null;
  loadingOrderDetails: boolean = false;
  selectedOrder: PedidoResponse | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private pedidoService: PedidoService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) {
    addIcons({
      'eye-outline': eyeOutline,
      'close-outline': closeOutline,
      'refresh-outline': refreshOutline,
      'bag-outline': bagOutline,
      'musical-notes-outline': musicalNotesOutline,
      'chevron-down-outline': chevronDownOutline,
      'chevron-up-outline': chevronUpOutline
    });
  }

  ngOnInit() {
    // Obtener los datos del usuario
    this.currentUser = this.authService.getUserData();

    // Cargar los pedidos del usuario
    this.loadUserOrders();
  }

  async loadUserOrders() {
    this.isLoading = true;

    const loading = await this.loadingController.create({
      message: 'Cargando pedidos...'
    });

    await loading.present();

    this.pedidoService.obtenerPedidos()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          loading.dismiss();
        })
      )
      .subscribe({
        next: (pedidos) => {
          this.userOrders = pedidos;
          this.hasOrders = pedidos.length > 0;
          console.log('Pedidos cargados:', pedidos);
        },
        error: (err) => {
          console.error('Error al cargar pedidos:', err);
          this.error = 'Error al cargar los pedidos';
          this.showToast('No se pudieron cargar sus pedidos', 'danger');
        }
      });
  }

  toggleOrderDetails(orderId: number) {
    // Si ya estamos mostrando este pedido, lo ocultamos
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
      this.selectedOrder = null;
      return;
    }

    // Si no tenemos los detalles del pedido, los cargamos
    this.loadingOrderDetails = true;
    this.expandedOrderId = orderId;

    this.pedidoService.obtenerPedidoPorId(orderId)
      .pipe(
        finalize(() => {
          this.loadingOrderDetails = false;
        })
      )
      .subscribe({
        next: (pedido) => {
          this.selectedOrder = pedido;
        },
        error: (err) => {
          console.error('Error al cargar detalles del pedido:', err);
          this.showToast('No se pudieron cargar los detalles del pedido', 'danger');
          this.expandedOrderId = null;
        }
      });
  }

  getOrderStatusColor(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'PENDIENTE': return 'warning';
      case 'CONFIRMADO': return 'primary';
      case 'EN_PREPARACION': return 'secondary';
      case 'ENVIADO': return 'tertiary';
      case 'ENTREGADO': return 'success';
      case 'CANCELADO': return 'danger';
      default: return 'medium';
    }
  }

  explorePianos() {
    this.router.navigate(['/']);
  }

  async changePassword() {
    // Obtener datos del usuario actual
    const userData = this.authService.getUserData();

    if (!userData) {
      this.showToast('No se pudo obtener información del usuario', 'danger');
      return;
    }

    // Crear un objeto de tipo UsuarioDTO
    const userDto: UsuarioDTO = {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      estado: 'activo', // Valor por defecto
      fechaRegistro: new Date(),
      ultimoLogin: new Date()
    };

    const modal = await this.modalController.create({
      component: UserFormComponent,
      componentProps: {
        usuario: userDto,
        isEdit: true,
        passwordOnly: true // Propiedad adicional para indicar que solo queremos cambiar la contraseña
      },
      cssClass: 'user-form-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const updatedUser = result.data;
        const nuevaContrasena = (updatedUser as any).nuevaContrasena;

        if (nuevaContrasena) {
          // Aquí iría la llamada al servicio para actualizar la contraseña
          console.log('Actualizando contraseña para:', updatedUser.email);
          this.showToast('Contraseña actualizada correctamente', 'success');
        }
      }
    });

    return await modal.present();
  }

  async updatePersonalInfo() {
    // Obtener datos del usuario actual
    const userData = this.authService.getUserData();

    if (!userData) {
      this.showToast('No se pudo obtener información del usuario', 'danger');
      return;
    }

    // Crear un objeto de tipo UsuarioDTO
    const userDto: UsuarioDTO = {
      id: userData.id,
      nombre: userData.nombre,
      email: userData.email,
      rol: userData.rol,
      estado: 'activo', // Valor por defecto
      fechaRegistro: new Date(),
      ultimoLogin: new Date()
    };

    const modal = await this.modalController.create({
      component: UserFormComponent,
      componentProps: {
        usuario: userDto,
        isEdit: true,
        infoOnly: true // Propiedad adicional para indicar que solo queremos editar la información básica
      },
      cssClass: 'user-form-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const updatedUser = result.data;

        // Aquí iría la llamada al servicio para actualizar la información del usuario
        console.log('Actualizando información para:', updatedUser.nombre);

        // Actualizar los datos del usuario en el servicio de autenticación
        // (esto debería estar implementado en el servicio real)
        this.showToast('Información actualizada correctamente', 'success');
      }
    });

    return await modal.present();
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await toast.present();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  formatDate(date: any): string {
    return new Date(date).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
