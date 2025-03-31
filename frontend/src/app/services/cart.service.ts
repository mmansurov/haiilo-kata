import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Item } from '../models/item.model';
import { ItemService } from './item.service';
import { CartItem } from '../models/cart.model';
import { PriceCalculatorService } from './price-calculator.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);

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
      // Items > 1, decrement quantity
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
      // Items == 1, remove from cart
      updatedItems = currentItems.filter(cartItem => cartItem.item.id !== item.id);
    }

    this.cartItemsSubject.next(updatedItems);
  }
}