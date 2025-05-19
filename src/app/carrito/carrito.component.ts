// carrito.component.ts
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertController, LoadingController, ToastController, IonModal } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import {
  trashOutline,
  removeOutline,
  addOutline,
  homeOutline,
  cardOutline,
  cashOutline,
  locationOutline,
  checkmarkOutline,
  closeOutline
} from 'ionicons/icons';
import { PianoService, Piano } from '../1-Servicios/piano.service';
import { CartService } from '../1-Servicios/carrito.service';
import { PedidoService } from '../1-Servicios/pedido.service';
import { CrearPedidoRequest } from '../1-Servicios/models';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../1-Servicios/auth.service';
import { Router } from '@angular/router';

interface CartItem extends Piano {
  quantity: number;
}

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule]
})
export class CarritoComponent implements OnInit, OnDestroy {
  @ViewChild('checkoutModal') checkoutModal!: IonModal;

  cart: CartItem[] = [];
  currentYear: number = new Date().getFullYear();
  private cartSubscription: Subscription | undefined;
  private isInitialLoad = true;
  isLoading = false;

  // Checkout form
  checkoutForm: FormGroup;
  processingOrder = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private pianoService: PianoService,
    private cartService: CartService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    // Inicializar el formulario de checkout
    this.checkoutForm = this.formBuilder.group({
      direccionEnvio: ['', [Validators.required, Validators.minLength(10)]],
      metodoPago: ['tarjeta', Validators.required]
    });
  }

  ngOnInit() {
    addIcons({
      'trash-outline': trashOutline,
      'remove-outline': removeOutline,
      'add-outline': addOutline,
      'home-outline': homeOutline,
      'card-outline': cardOutline,
      'cash-outline': cashOutline,
      'location-outline': locationOutline,
      'checkmark-outline': checkmarkOutline,
      'close-outline': closeOutline
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
    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      // Guardar la ruta de retorno
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: '/carrito' }
      });
      return;
    }

    // Mostrar el modal de checkout
    this.checkoutModal.present();
  }

  async submitOrder() {
    if (this.checkoutForm.invalid) {
      this.showToast('Por favor complete todos los campos correctamente', 'warning');
      return;
    }

    // Mostrar indicador de carga
    this.processingOrder = true;
    const loading = await this.loadingController.create({
      message: 'Procesando pedido...'
    });
    await loading.present();

    // Crear la solicitud de pedido
    const pedidoRequest: CrearPedidoRequest = {
      direccionEnvio: this.checkoutForm.value.direccionEnvio,
      metodoPago: this.checkoutForm.value.metodoPago
    };

    // Llamar al servicio para crear el pedido
    this.pedidoService.crearPedido(pedidoRequest)
      .pipe(
        finalize(() => {
          this.processingOrder = false;
          loading.dismiss();
          this.checkoutModal.dismiss();
        })
      )
      .subscribe({
        next: (response) => {
          // Pedido creado exitosamente
          this.showOrderSuccessAlert(response.id);

          // Limpiar el carrito (el backend ya lo hace, pero actualizamos el frontend)
          this.cartService.clearCart();

          // Resetear el formulario
          this.checkoutForm.reset({
            metodoPago: 'tarjeta'
          });
        },
        error: (error) => {
          console.error('Error al crear el pedido:', error);
          this.showToast('Error al procesar el pedido. Por favor, inténtelo de nuevo.', 'danger');
        }
      });
  }

  async showOrderSuccessAlert(orderId: number) {
    const alert = await this.alertController.create({
      header: '¡Pedido Realizado!',
      message: `Su pedido #${orderId} se ha procesado correctamente. Recibirá actualizaciones sobre el estado de su pedido.`,
      buttons: [
        {
          text: 'Ver mis pedidos',
          handler: () => {
            this.router.navigate(['/perfil']);
          }
        },
        {
          text: 'Seguir comprando',
          handler: () => {
            this.navigateToHome();
          }
        }
      ]
    });

    await alert.present();
  }

  cancelCheckout() {
    this.checkoutModal.dismiss();
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

  protected readonly parseFloat = parseFloat;
}
