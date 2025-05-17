// producto.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { NavController, IonModal } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  bagOutline,
  musicalNotesOutline,
  searchOutline,
  removeCircleOutline,
  addCircleOutline
} from 'ionicons/icons';
import { PianoService, Piano } from '../1-Servicios/piano.service';
import { CartService } from '../1-Servicios/carrito.service';
import {AuthService} from "../1-Servicios/auth.service";

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class ProductoComponent implements OnInit {
  @ViewChild('searchModal') searchModal!: IonModal;
  productId: number = 0;
  piano: Piano | undefined;
  quantity: number = 1;
  currentYear: number = new Date().getFullYear();
  searchQuery: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController,
    private pianoService: PianoService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    addIcons({
      'musical-notes-outline': musicalNotesOutline,
      'bag-outline': bagOutline,
      'search-outline': searchOutline,
      'remove-circle-outline': removeCircleOutline,
      'add-circle-outline': addCircleOutline
    });

    // Obtener el ID del producto de los parámetros de la URL
    this.route.params.subscribe(params => {
      this.productId = parseInt(params['id'] || '1');
      this.loadProductData();
    });
  }

  loadProductData() {
    // Obtener los datos del piano del servicio
    this.piano = this.pianoService.getPianoById(this.productId);
  }

  increaseQuantity() {
    this.quantity = this.quantity + 1;
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity = this.quantity - 1;
    }
  }

  handleAddToCart() {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      // Navigate to login page with the return URL
      // Using the existing query param mechanism from your login component
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/producto/${this.productId}` }
      });
      return;
    }

    // User is authenticated, proceed with adding to cart
    if (this.piano) {
      this.cartService.addToCart(this.piano.id!, this.quantity);

      // Show confirmation message (you could replace with a Toast)
      alert(`Se ha añadido ${this.quantity} ${this.piano.model} al carrito`);

      // Navigate to cart
      this.navCtrl.navigateForward('/carrito');
    }
  }

  navigateToHome() {
    this.navCtrl.navigateBack('/');
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
}
