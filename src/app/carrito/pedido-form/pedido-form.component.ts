// src/app/carrito/pedido-form/pedido-form.component.ts
import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  IonTextarea,
  IonIcon,
  IonRow,
  IonCol,
  IonRadio,
  IonRadioGroup,
  IonList,
  IonListHeader,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline,
  locationOutline,
  cardOutline,
  cashOutline,
  checkmarkOutline
} from 'ionicons/icons';

// Definir una interfaz para el formulario del pedido
export interface PedidoFormData {
  direccionEnvio: string;
  metodoPago: string;
}

@Component({
  selector: 'app-pedido-form',
  templateUrl: './pedido-form.component.html',
  styleUrls: ['./pedido-form.component.scss'],
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
    IonTextarea,
    IonIcon,
    IonRadio,
    IonRadioGroup,
  ]
})
export class PedidoFormComponent implements OnInit {
  @Input() totalPrice: number = 0;
  @Input() processingOrder: boolean = false;

  // Objeto con los datos del formulario
  pedido: PedidoFormData = {
    direccionEnvio: '',
    metodoPago: 'tarjeta'
  };

  constructor(private modalController: ModalController) {
    addIcons({
      'close-outline': closeOutline,
      'location-outline': locationOutline,
      'card-outline': cardOutline,
      'cash-outline': cashOutline,
      'checkmark-outline': checkmarkOutline
    });
  }

  ngOnInit() {}

  dismiss(data?: any) {
    this.modalController.dismiss(data);
  }

  onSubmit() {
    // Validación básica
    if (!this.pedido.direccionEnvio || this.pedido.direccionEnvio.trim().length < 10) {
      // Podríamos mostrar un toast o alerta aquí
      return;
    }

    // Devolver los datos del pedido al componente padre
    this.dismiss(this.pedido);
  }

  cancel() {
    this.dismiss();
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }
}
