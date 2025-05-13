import { Component, ViewChild } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonIcon,
  IonButton,
  IonCol,
  IonModal,
  IonItem,
  IonInput
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bagOutline, musicalNotesOutline, searchOutline, personOutline } from 'ionicons/icons';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../1-Servicios/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle,
    IonButtons, IonMenuButton, IonIcon,
    IonButton, IonCol, IonModal, IonItem, IonInput,
    NgIf, FormsModule, RouterLink
  ],
})
export class HeaderComponent {
  @ViewChild('searchModal') searchModal!: IonModal;
  searchQuery: string = '';

  constructor(private authService: AuthService) {
    addIcons({
      'musical-notes-outline': musicalNotesOutline,
      'bag-outline': bagOutline,
      'search-outline': searchOutline,
      'person-outline': personOutline
    });
  }

  openSearchModal() {
    this.searchModal.present();
  }

  closeSearchModal() {
    this.searchModal.dismiss();
  }

  performSearch() {
    console.log('Buscando:', this.searchQuery);
    this.closeSearchModal();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  handleLogout() {
    this.authService.logout();
    // No necesitamos navegar aquí, ya que el método logout ya incluye la navegación
  }

}
