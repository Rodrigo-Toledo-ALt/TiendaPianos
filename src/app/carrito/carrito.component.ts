// carrito.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
export class CarritoComponent implements OnInit, OnDestroy {
  cart: CartItem[] = [];
  currentYear: number = new Date().getFullYear();
  private cartSubscription: Subscription | undefined;
  private isInitialLoad = true;
  isLoading = false;

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

    // Cargar datos inmediatamente desde la memoria local
    this.cart = this.cartService.getCartItems();

    // Configurar la suscripción al observable del carrito
    this.setupCartSubscription();

    // Iniciar la carga de datos
    this.loadCart();

    // Añadir listener para cuando la vista de Ionic entre de nuevo
    document.addEventListener('ionViewWillEnter', this.ionViewWillEnterHandler);

    // Listener para cuando la ventana reciba foco después de perderlo
    window.addEventListener('focus', this.windowFocusHandler);
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones y event listeners
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    document.removeEventListener('ionViewWillEnter', this.ionViewWillEnterHandler);
    window.removeEventListener('focus', this.windowFocusHandler);
  }

  // Handler que mantiene la referencia this correcta
  private ionViewWillEnterHandler = () => {
    this.loadCart();
  }

  // Handler para el evento focus de la ventana
  private windowFocusHandler = () => {
    this.loadCart();
  }

  private setupCartSubscription() {
    // Desuscribirse primero si ya existe una suscripción
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }

    // Suscribirse al observable cartItems$
    this.cartSubscription = this.cartService.cartItems$.subscribe(items => {
      // Solo actualizar si hay elementos o si no estamos en la carga inicial
      if (items.length > 0 || !this.isInitialLoad) {
        this.cart = items;
      }
    });
  }

  loadCart() {
    this.isLoading = true;
    this.isInitialLoad = true;

    // Intentar cargar desde el backend primero (si está autenticado)
    this.cartService.obtenerCarrito()
      .pipe(finalize(() => {
        this.isInitialLoad = false;
        this.isLoading = false;
      }))
      .subscribe({
        next: (backendItems) => {
          // Si no hay items del backend o la respuesta está vacía,
          // asegurarse de cargar desde localStorage
          if (!backendItems || backendItems.length === 0) {
            this.cart = this.cartService.getCartItems();
          }
          // Si hay items, el cartService se encargará de notificar
          // a través del observable cartItems$
        },
        error: (err) => {
          console.error('Error cargando carrito:', err);
          // En caso de error, cargar desde localStorage
          this.cart = this.cartService.getCartItems();
        }
      });
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(id);
    // No es necesario llamar a loadCart() aquí porque la suscripción
    // a cartItems$ se encargará de actualizar el carrito
  }

  updateQuantity(id: number, quantity: number) {
    this.cartService.updateQuantity(id, quantity);
    // No es necesario llamar a loadCart() aquí porque la suscripción
    // a cartItems$ se encargará de actualizar el carrito
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

  parsePrice(price: string): number {
    return this.cartService.parsePrice(price);
  }

  // Método para permitir la recarga manual del carrito
  reloadCart() {
    this.loadCart();
  }

  protected readonly parseFloat = parseFloat;
}
