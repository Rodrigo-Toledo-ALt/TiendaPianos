// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PianoService, Piano } from '../../1-Servicios/piano.service';
import { PianoFormComponent } from './piano-form/piano-form.component';
import { PianoDTO } from '../../1-Servicios/models';
import { finalize } from 'rxjs/operators';
import {addIcons} from "ionicons";
import {
  addCircleOutline,
  closeOutline,
  createOutline,
  powerOutline,
  refreshOutline,
  trashOutline
} from "ionicons/icons";
import {UsuariosComponent} from "./usuarios/usuarios.component";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, UsuariosComponent]
})
export class AdminDashboardComponent implements OnInit {
  pianos: Piano[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private pianoService: PianoService,
    private modalController: ModalController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.loadPianos();

    addIcons({
      'add-circle-outline': addCircleOutline,
      'create-outline': createOutline,
      'trash-outline': trashOutline,
      'refresh-outline': refreshOutline,
      'power-outline': powerOutline,
      'close-outline': closeOutline
    });
  }

  async loadPianos() {
    const loading = await this.loadingController.create({
      message: 'Cargando pianos...'
    });
    await loading.present();

    this.isLoading = true;
    this.error = null;

    this.pianoService.obtenerTodosLosPianos()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          loading.dismiss();
        })
      )
      .subscribe({
        next: (pianosDTOs: PianoDTO[]) => {
          // Usar el método del servicio para convertir
          this.pianos = this.pianoService.convertirDTOsAPianos(pianosDTOs);
        },
        error: (err) => {
          console.error('Error al cargar pianos:', err);
          this.error = 'Error al cargar los pianos. Por favor, inténtelo de nuevo.';
          this.showToast('Error al cargar los pianos', 'danger');
        }
      });
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
        const newPiano = result.data;
        const pianoDTOToCreate = this.pianoService.convertirPianoADTO(newPiano);

        this.pianoService.crearPiano(pianoDTOToCreate)
          .subscribe({
            next: () => {
              this.showToast('Piano añadido correctamente', 'success');
              this.loadPianos(); // Recargar la lista después de crear
            },
            error: (err) => {
              console.error('Error al crear piano:', err);
              this.showToast('Error al crear el piano', 'danger');
            }
          });
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
        const updatedPiano = result.data;
        const pianoDTOToUpdate = this.pianoService.convertirPianoADTO(updatedPiano);

        this.pianoService.actualizarPiano(updatedPiano.id!, pianoDTOToUpdate)
          .subscribe({
            next: () => {
              this.showToast('Piano actualizado correctamente', 'success');
              this.loadPianos(); // Recargar la lista después de actualizar
            },
            error: (err) => {
              console.error('Error al actualizar piano:', err);
              this.showToast('Error al actualizar el piano', 'danger');
            }
          });
      }
    });

    return await modal.present();
  }

  async togglePianoStatus(piano: Piano) {
    // Si el piano está activo, lo desactivamos (llamando a eliminarPiano)
    // Si el piano está inactivo, lo activamos (llamando a actualizarPiano)
    const isCurrentlyActive = piano.estado === 'activo';
    const newStatus = isCurrentlyActive ? 'inactivo' : 'activo';
    const actionText = isCurrentlyActive ? 'desactivar' : 'activar';

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Está seguro de ${actionText} el piano "${piano.name} ${piano.model}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          handler: () => {
            this.loadingController.create({
              message: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)}ando piano...`
            }).then(loading => {
              loading.present();

              // Operación depende del estado actual
              let operation;

              if (isCurrentlyActive) {
                // Si está activo, llamamos a eliminarPiano (que en realidad lo desactiva)
                operation = this.pianoService.eliminarPiano(piano.id!);
              } else {
                // Si está inactivo, llamamos a actualizarPiano para activarlo
                const pianoToUpdate = { ...piano, estado: 'activo' };
                const pianoDTOToUpdate = this.pianoService.convertirPianoADTO(pianoToUpdate);
                operation = this.pianoService.actualizarPiano(piano.id!, pianoDTOToUpdate);
              }

              // Procesar la operación
              operation.pipe(
                finalize(() => loading.dismiss())
              ).subscribe({
                next: () => {
                  this.showToast(`Piano ${actionText}do correctamente`, 'success');
                  this.loadPianos(); // Recargar la lista para reflejar el cambio
                },
                error: (err) => {
                  console.error(`Error al ${actionText} piano:`, err);
                  this.showToast(`Error al ${actionText} el piano`, 'danger');
                }
              });
            });
          }
        }
      ]
    });

    await alert.present();
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
}
