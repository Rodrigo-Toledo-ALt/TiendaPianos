// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PianoService, Piano } from '../../1-Servicios/piano.service';
import { PianoFormComponent } from './piano-form/piano-form.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule]
})
export class AdminDashboardComponent implements OnInit {
  pianos: Piano[] = [];

  constructor(
    private pianoService: PianoService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.loadPianos();
  }

  loadPianos() {
    this.pianos = this.pianoService.getAllPianos();
  }

  async openAddPianoModal() {
    const modal = await this.modalController.create({
      component: PianoFormComponent,
      componentProps: {
        isEdit: false
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Nota: Tu PianoService actual no tiene método addPiano
        // Aquí podrías implementar lógica para agregar un piano
        // Por ahora, solo recargamos los pianos
        this.loadPianos();
        this.showToast('Piano añadido correctamente');
      }
    });

    return await modal.present();
  }

  async openEditPianoModal(piano: Piano) {
    const modal = await this.modalController.create({
      component: PianoFormComponent,
      componentProps: {
        isEdit: true,
        piano: {...piano}
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        // Nota: Tu PianoService actual no tiene método updatePiano
        // Aquí podrías implementar lógica para actualizar un piano
        // Por ahora, solo recargamos los pianos
        this.loadPianos();
        this.showToast('Piano actualizado correctamente');
      }
    });

    return await modal.present();
  }

  async deletePiano(piano: Piano) {
    const alert = document.createElement('ion-alert');
    alert.header = 'Confirmar';
    alert.message = '¿Está seguro de eliminar este piano?';
    alert.buttons = [
      {
        text: 'Cancelar',
        role: 'cancel'
      }, {
        text: 'Eliminar',
        handler: () => {
          // Nota: Tu PianoService actual no tiene método deletePiano
          // Aquí podrías implementar lógica para eliminar un piano
          // Por ahora, solo recargamos los pianos
          this.loadPianos();
          this.showToast('Piano eliminado correctamente');
        }
      }
    ];

    document.body.appendChild(alert);
    await alert.present();
  }

  showToast(message: string) {
    const toast = document.createElement('ion-toast');
    toast.message = message;
    toast.duration = 2000;
    toast.position = 'bottom';

    document.body.appendChild(toast);
    toast.present();
  }
}
