import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioDTO } from 'src/app/1-Servicios/models';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, trashOutline, addOutline } from 'ionicons/icons';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonIcon
  ]
})
export class UserFormComponent implements OnInit {
  @Input() usuario: UsuarioDTO = {} as UsuarioDTO;
  @Input() isEdit: boolean = false;
  @Input() passwordOnly: boolean = false; // Nueva propiedad para modo cambio de contraseña
  @Input() infoOnly: boolean = false;     // Nueva propiedad para modo actualización de info

  // Para manejo de contraseñas
  contrasenaActual: string = '';
  nuevaContrasena: string = '';
  confirmarContrasena: string = '';
  passwordError: string = '';

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    console.log('UserFormComponent inicializado con:', this.usuario);
    addIcons({
      'close-outline': closeOutline,
      'trash-outline': trashOutline,
      'add-outline': addOutline
    });
  }

  dismiss(data?: any) {
    console.log('Dismissing modal with data:', data);
    this.modalController.dismiss(data);
  }

  onSubmit() {
    console.log('Form submitted');

    // Validaciones según el modo
    if (this.passwordOnly || this.nuevaContrasena || this.confirmarContrasena) {
      // Si estamos en modo contraseña o se ha introducido una contraseña
      if (this.nuevaContrasena !== this.confirmarContrasena) {
        this.passwordError = 'Las contraseñas no coinciden';
        return;
      }

      if (this.nuevaContrasena.length < 6) {
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
        return;
      }

      // Añadir la contraseña al objeto usuario para el backend
      (this.usuario as any).nuevaContrasena = this.nuevaContrasena;

      // Si estamos en modo solo contraseña, también incluimos la contraseña actual
      if (this.passwordOnly && this.contrasenaActual) {
        (this.usuario as any).contrasenaActual = this.contrasenaActual;
      }
    }

    // Validación básica de la información
    if (!this.passwordOnly && (!this.usuario.nombre || !this.usuario.email)) {
      this.passwordError = 'Nombre y correo electrónico son obligatorios';
      return;
    }

    this.dismiss(this.usuario);
  }

  cancel() {
    console.log('Form cancelled');
    this.dismiss();
  }

  // Métodos para manejar cambios en los inputs y evitar problemas de foco
  updateNombre(event: any) {
    this.usuario.nombre = event.detail.value;
  }

  updateEmail(event: any) {
    this.usuario.email = event.detail.value;
  }

  updateRol(event: any) {
    this.usuario.rol = event.detail.value;
  }

  updateEstado(event: any) {
    this.usuario.estado = event.detail.value;
  }

  updatePassword(event: any) {
    this.nuevaContrasena = event.detail.value;
  }

  updateConfirmPassword(event: any) {
    this.confirmarContrasena = event.detail.value;
  }

  updateCurrentPassword(event: any) {
    this.contrasenaActual = event.detail.value;
  }
}
