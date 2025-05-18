import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { UsuarioService } from '../../../1-Servicios/usuario.service';
import { UsuarioDTO } from '../../../1-Servicios/models';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  refreshOutline,
  powerOutline,
  createOutline
} from 'ionicons/icons';
import { finalize } from 'rxjs/operators';
import { UserFormComponent } from '../user-form/user-form.component';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class UsuariosComponent implements OnInit {
  usuarios: UsuarioDTO[] = [];
  cargando = false;
  error = '';

  constructor(
    private usuarioService: UsuarioService,
    private alertController: AlertController,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    addIcons({
      'eye-outline': eyeOutline,
      'refresh-outline': refreshOutline,
      'power-outline': powerOutline,
      'create-outline': createOutline
    });

    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.cargando = true;
    this.error = '';

    this.usuarioService.obtenerTodosLosUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
        console.error('Error al cargar usuarios', err);
      }
    });
  }

  // Método para ver detalles de un usuario
  async verDetallesUsuario(usuario: UsuarioDTO) {
    const alert = await this.alertController.create({
      header: 'Detalles del Usuario',
      message: `
        <p><strong>ID:</strong> ${usuario.id}</p>
        <p><strong>Nombre:</strong> ${usuario.nombre}</p>
        <p><strong>Email:</strong> ${usuario.email}</p>
        <p><strong>Rol:</strong> ${usuario.rol}</p>
        <p><strong>Estado:</strong> ${usuario.estado || 'activo'}</p>
        <p><strong>Registro:</strong> ${new Date(usuario.fechaRegistro).toLocaleDateString()}</p>
        <p><strong>Último Login:</strong> ${usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleString() : 'N/A'}</p>
      `,
      buttons: ['Cerrar']
    });

    await alert.present();
  }

  // Método para cambiar el estado de un usuario (activo/inactivo)
  async cambiarEstadoUsuario(usuario: UsuarioDTO) {
    const nuevoEstado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Está seguro de ${accion} al usuario ${usuario.nombre}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: `${accion.charAt(0).toUpperCase() + accion.slice(1)}ando usuario...`
            });
            await loading.present();

            this.usuarioService.cambiarEstadoUsuario(usuario.id, nuevoEstado)
              .pipe(finalize(() => loading.dismiss()))
              .subscribe({
                next: (usuarioActualizado) => {
                  // Actualizar el usuario en la lista
                  const index = this.usuarios.findIndex(u => u.id === usuario.id);
                  if (index !== -1) {
                    this.usuarios[index] = usuarioActualizado;
                  }
                  this.mostrarToast(`Usuario ${accion}do correctamente`, 'success');
                },
                error: (err) => {
                  console.error(`Error al ${accion} usuario:`, err);
                  this.mostrarToast(`Error al ${accion} usuario`, 'danger');
                }
              });
          }
        }
      ]
    });

    await alert.present();
  }

  // Método para abrir el modal de edición usando el componente UserFormComponent
  async editarUsuario(usuario: UsuarioDTO) {
    const modal = await this.modalController.create({
      component: UserFormComponent,
      componentProps: {
        usuario: { ...usuario }, // Pasar una copia para no modificar el original
        isEdit: true
      }
    });

    modal.onDidDismiss().then(result => {
      if (result.data) {
        const usuarioModificado = result.data;

        this.actualizarUsuario(usuarioModificado);
      }
    });

    return await modal.present();
  }

  // Método para actualizar un usuario en el backend
  async actualizarUsuario(usuario: UsuarioDTO) {
    const loading = await this.loadingController.create({
      message: 'Actualizando usuario...'
    });
    await loading.present();

    // Extraer contraseña si existe
    const nuevaContrasena = (usuario as any).nuevaContrasena;
    delete (usuario as any).nuevaContrasena;

    this.usuarioService.actualizarUsuario(
      usuario.id,
      usuario.nombre,
      usuario.email,
      usuario.rol,
      usuario.estado
    )
      .pipe(finalize(() => loading.dismiss()))
      .subscribe({
        next: (usuarioActualizado) => {
          // Actualizar el usuario en la lista
          const index = this.usuarios.findIndex(u => u.id === usuario.id);
          if (index !== -1) {
            this.usuarios[index] = usuarioActualizado;
          }
          this.mostrarToast('Usuario actualizado correctamente', 'success');
        },
        error: (err) => {
          console.error('Error al actualizar usuario:', err);
          this.mostrarToast('Error al actualizar usuario: ' + (err.error?.message || err.message || 'Error desconocido'), 'danger');
        }
      });
  }

  // Método para mostrar toast
  async mostrarToast(mensaje: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message: mensaje,
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
}
