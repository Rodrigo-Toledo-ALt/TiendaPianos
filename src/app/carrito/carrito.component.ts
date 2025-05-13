// carrito.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  removeOutline,
  addOutline,
  homeOutline
} from 'ionicons/icons';
import { PianoService, Piano } from '../1-Servicios/piano.service';
import { CartService } from '../1-Servicios/carrito.service';

interface CartItem extends Piano {
  quantity: number;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class CarritoComponent implements OnInit {
  cart: CartItem[] = [];
  currentYear: number = new Date().getFullYear();

  constructor(
    private navCtrl: NavController,
    private pianoService: PianoService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    addIcons({
      'trash-outline': trashOutline,
      'remove-outline': removeOutline,
      'add-outline': addOutline,
      'home-outline': homeOutline
    });

    this.loadCart();
  }

  loadCart() {
    this.cart = this.cartService.getCartItems();
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(id);
    this.loadCart();
  }

  updateQuantity(id: number, quantity: number) {
    this.cartService.updateQuantity(id, quantity);
    this.loadCart();
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/\./g, '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0);
  }

  handleCheckout() {
    // En un caso real, navegaría a un proceso de pago
    alert('Procesando pedido. Gracias por su compra!');
    this.cartService.clearCart();
    this.navigateToHome();
  }

  navigateToHome() {
    this.navCtrl.navigateBack('/');
  }

  formatCurrency(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  // carrito.component.ts
  parsePrice(price: string): number {
    return this.cartService.parsePrice(price);
  }

  protected readonly parseFloat = parseFloat;
}
