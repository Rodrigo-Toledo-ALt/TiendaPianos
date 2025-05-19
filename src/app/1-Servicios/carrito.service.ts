// 1-Servicios/carrito.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { PianoService, Piano } from './piano.service';
import { CarritoResponse, AgregarAlCarritoRequest, ActualizarCantidadRequest, MensajeResponseDTO } from './models';

export interface CartItem extends Piano {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api';

  // Para mantener compatibilidad con el código existente
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  // Para el nuevo backend
  private carritoItemsSubject = new BehaviorSubject<CarritoResponse[]>([]);
  carritoItems$ = this.carritoItemsSubject.asObservable();

  constructor(
    private pianoService: PianoService,
    private http: HttpClient
  ) {
    // Intentar cargar el carrito del backend si el usuario está autenticado
    // o de localStorage si no lo está
    this.obtenerCarrito().subscribe({
      next: (items) => {
        if (items && items.length > 0) {
          // Tenemos carrito en el backend
          this.carritoItemsSubject.next(items);
          // Convertir al formato antiguo para compatibilidad
          this.syncBackendCartToLocal(items);
        } else {
          // No hay carrito en el backend, intentar cargar de localStorage
          this.loadCartFromStorage();
        }
      },
      error: () => {
        // Error al cargar del backend, intentar local
        this.loadCartFromStorage();
      }
    });
  }

  // Métodos para interactuar con el backend
  obtenerCarrito(): Observable<CarritoResponse[]> {
    return this.http.get<CarritoResponse[]>(`${this.apiUrl}/carrito`).pipe(
      catchError(error => {
        console.error('Error al obtener el carrito', error);
        return of([]);
      })
    );
  }

  agregarAlCarrito(pianoId: number, cantidad: number): Observable<CarritoResponse> {
    const request: AgregarAlCarritoRequest = { pianoId, cantidad };
    return this.http.post<CarritoResponse>(`${this.apiUrl}/carrito/agregar`, request).pipe(
      tap(response => {
        // Actualizar el carrito local con la respuesta
        this.actualizarCarritoLocal();
      }),
      catchError(error => {
        console.error('Error al agregar al carrito', error);
        return throwError(() => new Error('Error al Agregar al carrito'));
      })
    );
  }

  actualizarCantidad(itemId: number, cantidad: number): Observable<CarritoResponse> {
    const request: ActualizarCantidadRequest = { cantidad };
    return this.http.put<CarritoResponse>(`${this.apiUrl}/carrito/${itemId}`, request).pipe(
      tap(response => {
        this.actualizarCarritoLocal();
      }),
      catchError(error => {
        console.error('Error al actualizar cantidad', error);
        return throwError(() => new Error('Error al actualizar cantidad'));
      })
    );
  }

  eliminarItem(itemId: number): Observable<MensajeResponseDTO> {
    return this.http.delete<MensajeResponseDTO>(`${this.apiUrl}/carrito/${itemId}`).pipe(
      tap(response => {
        this.actualizarCarritoLocal();
      }),
      catchError(error => {
        console.error('Error al eliminar item', error);
        return of({ mensaje: 'Error al eliminar item' });
      })
    );
  }

  vaciarCarrito(): Observable<MensajeResponseDTO> {
    return this.http.delete<MensajeResponseDTO>(`${this.apiUrl}/carrito`).pipe(
      tap(response => {
        this.cartItems = [];
        this.cartItemsSubject.next([]);
        this.carritoItemsSubject.next([]);
      }),
      catchError(error => {
        console.error('Error al vaciar carrito', error);
        return of({ mensaje: 'Error al vaciar carrito' });
      })
    );
  }

  private actualizarCarritoLocal(): void {
    this.obtenerCarrito().subscribe(items => {
      this.carritoItemsSubject.next(items);
      this.syncBackendCartToLocal(items);
    });
  }

  private syncBackendCartToLocal(items: CarritoResponse[]): void {
    // Convertir items del backend al formato local
    this.cartItems = items.map(item => {
      const piano = {
        id: item.pianoId,
        name: item.nombrePiano,
        model: item.modeloPiano,
        price: item.precioPiano.toString(),
        image: '', // No tenemos imagen en la respuesta del backend
      } as Piano;

      return {
        ...piano,
        quantity: item.cantidad
      };
    });

    this.cartItemsSubject.next([...this.cartItems]);
  }

  // Métodos para compatibilidad con el código existente
  private loadCartFromStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.cartItemsSubject.next(this.cartItems);
    }
  }


  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  addToCart(pianoId: number, quantity: number = 1) {
    // Intentar agregar al backend primero
    this.agregarAlCarrito(pianoId, quantity).subscribe({
      next: (response) => {
        // Éxito - el carritoItemsSubject ya se actualizó en agregarAlCarrito
        console.log('Producto agregado al carrito', response);
      },
      error: (err) => {
        console.error('Error al agregar al carrito en el backend:', err);

        // Falló - obtener el piano primero del backend
        this.pianoService.obtenerPianoPorId(pianoId).subscribe({
          next: (pianoDTO) => {
            // Convertir a formato Piano
            const piano = this.pianoService.convertirDTOAPiano(pianoDTO);

            // Agregar al carrito local
            this.agregarAlCarritoLocal(piano, quantity);
          },
          error: (err) => {
            console.error('Error al obtener información del piano:', err);
            // Informar al usuario de que no se pudo agregar al carrito
            // this.mostrarErrorToast('No se pudo agregar el producto al carrito');
          }
        });
      }
    });
  }

// Método auxiliar para agregar al carrito local
  private agregarAlCarritoLocal(piano: Piano, quantity: number): void {
    if (!piano) return;

    const existingItemIndex = this.cartItems.findIndex(item => item.id === piano.id);

    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      this.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      this.cartItems.push({
        ...piano,
        quantity
      });
    }


  }

  removeFromCart(pianoId: number) {
    // Buscar el itemId correspondiente en el carrito del backend
    const backendItems = this.carritoItemsSubject.getValue();
    const itemToRemove = backendItems.find(item => item.pianoId === pianoId);

    if (itemToRemove) {
      // Si existe en el backend, eliminarlo de allí
      this.eliminarItem(itemToRemove.id).subscribe({
        next: () => {
          console.log('Item eliminado del carrito');
        },
        error: () => {
          // Fallback a localStorage
          this.cartItems = this.cartItems.filter(item => item.id !== pianoId);

        }
      });
    } else {
      // Si no existe en el backend, eliminarlo solo localmente
      this.cartItems = this.cartItems.filter(item => item.id !== pianoId);

    }
  }

  updateQuantity(pianoId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(pianoId);
      return;
    }

    // Buscar el itemId correspondiente en el carrito del backend
    const backendItems = this.carritoItemsSubject.getValue();
    const itemToUpdate = backendItems.find(item => item.pianoId === pianoId);

    if (itemToUpdate) {
      // Si existe en el backend, actualizarlo allí
      this.actualizarCantidad(itemToUpdate.id, quantity).subscribe({
        next: () => {
          console.log('Cantidad actualizada');
        },
        error: () => {
          // Fallback a localStorage
          const itemIndex = this.cartItems.findIndex(item => item.id === pianoId);
          if (itemIndex !== -1) {
            this.cartItems[itemIndex].quantity = quantity;
          }
        }
      });
    } else {
      // Si no existe en el backend, actualizarlo solo localmente, funcionalidad eliminada
      const itemIndex = this.cartItems.findIndex(item => item.id === pianoId);
      if (itemIndex !== -1) {
        this.cartItems[itemIndex].quantity = quantity;

      }
    }
  }

  clearCart() {
    // Intentar vaciar el carrito en el backend primero
    this.vaciarCarrito().subscribe({
      next: () => {
        console.log('Carrito vaciado correctamente');
      },
      error: () => {
        // Fallback a localStorage
        this.cartItems = [];
        localStorage.removeItem('cart');
        this.cartItemsSubject.next([]);
      }
    });
  }

  getTotalPrice(): number {
    // Usar los items del backend si están disponibles
    const backendItems = this.carritoItemsSubject.getValue();
    if (backendItems && backendItems.length > 0) {
      return backendItems.reduce((total, item) => {
        return total + (item.precioPiano * item.cantidad);
      }, 0);
    }

    // Fallback a los items locales
    return this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/\./g, '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0);
  }

  getCartItemsCount(): number {
    // Usar los items del backend si están disponibles
    const backendItems = this.carritoItemsSubject.getValue();
    if (backendItems && backendItems.length > 0) {
      return backendItems.reduce((count, item) => count + item.cantidad, 0);
    }

    // Fallback a los items locales
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // Para convertir precios en formato string a número
  parsePrice(priceString: string): number {
    return parseFloat(priceString.replace(/\./g, '').replace(',', '.'));
  }
}
