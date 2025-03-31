import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, combineLatest, map } from 'rxjs';
import { CartItem, CheckoutError, CheckoutRequest, CheckoutResponse } from '../models/cart.model';
import { Item } from '../models/item.model';
import { ItemService } from './item.service';
import { PriceCalculatorService } from './price-calculator.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private checkoutErrorSubject = new BehaviorSubject<CheckoutError>({
    message: null,
    itemWithPriceChange: null,
    actualPrice: null
  });

  readonly checkoutError$ = this.checkoutErrorSubject.asObservable();

  readonly cartItems$ = combineLatest([
    this.cartItemsSubject,
    this.itemService.items$
  ]).pipe(
    map(([cartItems, items]) => {
      return cartItems.map(cartItem => {
        const updatedItem = items.find(item => item.id === cartItem.item.id);
        if (updatedItem) {
          return {
            ...cartItem,
            item: updatedItem,
            totalPrice: this.priceCalculator.calculateItemTotal(updatedItem, cartItem.quantity)
          };
        }
        return cartItem;
      });
    })
  );

  readonly total$ = this.cartItems$.pipe(
    map(items => this.priceCalculator.calculateCartTotal(items))
  );

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
    private priceCalculator: PriceCalculatorService
  ) {
  }

  addToCart(item: Item): void {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItem = currentItems.find(cartItem => cartItem.item.id === item.id);

    if (existingItem) {
      // Item exists, increment quantity
      const updatedItems = currentItems.map(cartItem =>
        cartItem.item.id === item.id
          ? {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            totalPrice: this.priceCalculator.calculateItemTotal(cartItem.item, cartItem.quantity + 1)
          }
          : cartItem
      );
      this.cartItemsSubject.next(updatedItems);
    } else {
      // New item, add to cart
      const newCartItem = {
        item,
        quantity: 1,
        totalPrice: this.priceCalculator.calculateItemTotal(item, 1)
      };
      this.cartItemsSubject.next([...currentItems, newCartItem]);
    }
  }

  removeFromCart(item: Item): void {
    const currentItems = this.cartItemsSubject.getValue();
    const existingItem = currentItems.find(cartItem => cartItem.item.id === item.id);

    if (!existingItem) return;

    let updatedItems: CartItem[];

    if (existingItem.quantity > 1) {
      updatedItems = currentItems.map(cartItem =>
        cartItem.item.id === item.id
          ? {
            ...cartItem,
            quantity: cartItem.quantity - 1,
            totalPrice: this.priceCalculator.calculateItemTotal(cartItem.item, cartItem.quantity - 1)
          }
          : cartItem
      );
    } else {
      updatedItems = currentItems.filter(cartItem => cartItem.item.id !== item.id);
    }

    this.cartItemsSubject.next(updatedItems);
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  checkout(): Observable<CheckoutResponse> {
    this.resetCheckoutError();

    const cartItems = this.cartItemsSubject.getValue();

    if (cartItems.length === 0) {
      const error = {message: 'Your cart is empty', itemWithPriceChange: null, actualPrice: null};
      this.checkoutErrorSubject.next(error);
      return of({success: false, errorMessage: error.message});
    }

    const total = this.priceCalculator.calculateCartTotal(cartItems);

    const request: CheckoutRequest = {items: cartItems, total};

    return this.http.post<CheckoutResponse>(`${environment.apiUrl}/orders/checkout`, request).pipe(
      tap(response => {
        if (response.success) {
          this.handleSuccessfulCheckout(response);
        } else {
          this.handleFailedCheckout(response);
        }
      })
    );
  }

  private handleSuccessfulCheckout(response: CheckoutResponse): void {
    this.clearCart();
    const totalMessage = response.total ?
      `Checkout successful! Total: ${response.total}€` :
      'Checkout successful!';
    alert(totalMessage);
  }

  private handleFailedCheckout(response: CheckoutResponse): void {
    if (response.itemIdWithPriceChange && response.actualPrice) {
      this.handlePriceChangeError(response);
    } else {
      this.checkoutErrorSubject.next({
        message: response.errorMessage || 'Checkout failed',
        itemWithPriceChange: null,
        actualPrice: null
      });
    }
  }

  private handlePriceChangeError(response: CheckoutResponse): void {
    const items = this.itemService.getItemsValue();
    const itemWithPriceChange = items.find(i => i.id === response.itemIdWithPriceChange) || null;

    if (itemWithPriceChange && itemWithPriceChange.currentPriceValue !== response.actualPrice) {
      this.checkoutErrorSubject.next({
        message: response.errorMessage || 'Price has changed',
        itemWithPriceChange,
        actualPrice: response.actualPrice
      });
    } else {
      this.handleSuccessfulCheckout(response);
    }
  }

  resetCheckoutError(): void {
    this.checkoutErrorSubject.next({
      message: null,
      itemWithPriceChange: null,
      actualPrice: null
    });
  }
}