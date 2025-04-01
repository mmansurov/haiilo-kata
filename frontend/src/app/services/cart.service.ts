import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, combineLatest, map, take, switchMap, catchError } from 'rxjs';
import { CartItem, CheckoutError, CheckoutRequest, CheckoutResponse } from '../models/cart.model';
import { Item } from '../models/item.model';
import { ItemService } from './item.service';
import { environment } from '../../environments/environment';
import { PriceCalculator } from '../utils/price-calculator';

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

  readonly cartItems$ = combineLatest([this.cartItemsSubject, this.itemService.items$])
    .pipe(
      map(([cartItems, items]) => {
        return cartItems.map(cartItem => {
          const updatedItem = items.find(item => item.id === cartItem.item.id);
          if (updatedItem) {
            return {
              ...cartItem,
              item: updatedItem,
              totalPrice: PriceCalculator.calculateItemTotal(updatedItem, cartItem.quantity)
            };
          }
          return cartItem;
        });
      })
    );

  readonly total$ = this.cartItems$.pipe(
    map(items => PriceCalculator.calculateCartTotal(items))
  );

  constructor(
    private http: HttpClient,
    private itemService: ItemService,
  ) {
  }

  addToCart(item: Item): void {
    this.cartItems$.pipe(
      take(1),
      tap(currentItems => {
        const existingItem = currentItems.find(cartItem => cartItem.item.id === item.id);

        let updatedItems: CartItem[];
        if (existingItem) {
          // Item exists, increment quantity
          updatedItems = currentItems.map(cartItem =>
            cartItem.item.id === item.id
              ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
                totalPrice: PriceCalculator.calculateItemTotal(cartItem.item, cartItem.quantity + 1)
              }
              : cartItem
          );
        } else {
          // New item, add to cart
          const newCartItem = {
            item,
            quantity: 1,
            totalPrice: PriceCalculator.calculateItemTotal(item, 1)
          };
          updatedItems = [...currentItems, newCartItem];
        }
        this.cartItemsSubject.next(updatedItems);
      })
    ).subscribe();
  }

  removeFromCart(item: Item): void {
    this.cartItems$.pipe(
      take(1),
      tap(currentItems => {
        const existingItem = currentItems.find(cartItem => cartItem.item.id === item.id);

        if (!existingItem) return;

        let updatedItems: CartItem[];
        if (existingItem.quantity > 1) {
          updatedItems = currentItems.map(cartItem =>
            cartItem.item.id === item.id
              ? {
                ...cartItem,
                quantity: cartItem.quantity - 1,
                totalPrice: PriceCalculator.calculateItemTotal(cartItem.item, cartItem.quantity - 1)
              }
              : cartItem
          );
        } else {
          updatedItems = currentItems.filter(cartItem => cartItem.item.id !== item.id);
        }
        this.cartItemsSubject.next(updatedItems);
      })
    ).subscribe();
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
  }

  resetCheckoutError(): void {
    this.checkoutErrorSubject.next({
      message: null,
      itemWithPriceChange: null,
      actualPrice: null
    });
  }

  // TODO prevent multiple clicks on checkout in case backend is slow, disable button, exhaustMap to ignore following clicks
  checkout(): Observable<CheckoutResponse> {
    this.resetCheckoutError();

    return this.cartItems$.pipe(
      take(1),
      switchMap(cartItems => this.processCheckout(cartItems))
    );
  }

  private processCheckout(cartItems: CartItem[]): Observable<CheckoutResponse> {
    if (cartItems.length === 0) {
      const error = {message: 'Your cart is empty', itemWithPriceChange: null, actualPrice: null};
      this.checkoutErrorSubject.next(error);
      return of({errorMessage: error.message});
    }

    const total = PriceCalculator.calculateCartTotal(cartItems);
    const request: CheckoutRequest = {items: cartItems, total};

    return this.http.post<CheckoutResponse>(`${environment.apiUrl}/orders/checkout`, request).pipe(
      tap(response => this.handleSuccessfulCheckout(response)),
      catchError(error => {
        this.handleFailedCheckout(error.error);
        throw error;
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
    this.itemService.items$.pipe(
      take(1),
      tap(items => {
        const itemWithPriceChange = items.find(i => i.id === response.itemIdWithPriceChange) || null;
        this.checkoutErrorSubject.next({
          message: response.errorMessage || 'Price has changed',
          itemWithPriceChange,
          actualPrice: response.actualPrice
        });
      })
    ).subscribe();
  }
}
