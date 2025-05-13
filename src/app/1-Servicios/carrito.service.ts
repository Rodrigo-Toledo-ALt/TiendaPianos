// 1-Servicios/cart.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PianoService, Piano } from './piano.service';

export interface CartItem extends Piano {
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private pianoService: PianoService) {
    this.loadCartFromStorage();
  }

  private loadCartFromStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.cartItemsSubject.next(this.cartItems);
    }
  }

  private saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
    this.cartItemsSubject.next([...this.cartItems]);
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  addToCart(pianoId: number, quantity: number = 1) {
    const piano = this.pianoService.getPianoById(pianoId);
    if (!piano) return;

    const existingItemIndex = this.cartItems.findIndex(item => item.id === pianoId);

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

    this.saveCartToStorage();
  }

  removeFromCart(pianoId: number) {
    this.cartItems = this.cartItems.filter(item => item.id !== pianoId);
    this.saveCartToStorage();
  }

  updateQuantity(pianoId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(pianoId);
      return;
    }

    const itemIndex = this.cartItems.findIndex(item => item.id === pianoId);

    if (itemIndex !== -1) {
      this.cartItems[itemIndex].quantity = quantity;
      this.saveCartToStorage();
    }
  }

  clearCart() {
    this.cartItems = [];
    localStorage.removeItem('cart');
    this.cartItemsSubject.next([]);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.price.replace(/\./g, '').replace(',', '.'));
      return total + (price * item.quantity);
    }, 0);
  }

  getCartItemsCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // En CartService
  parsePrice(priceString: string): number {
    return parseFloat(priceString.replace(/\./g, '').replace(',', '.'));
  }
}
