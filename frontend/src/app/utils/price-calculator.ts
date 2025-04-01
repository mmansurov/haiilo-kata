import { Item } from '../models/item.model';
import { CartItem } from '../models/cart.model';

export class PriceCalculator {

  static calculateItemTotal(item: Item, quantity: number): number {
    if (item.currentOffer && quantity >= item.currentOffer.quantity) {
      const offerSets = Math.floor(quantity / item.currentOffer.quantity);
      const remainingItems = quantity % item.currentOffer.quantity;
      return offerSets * item.currentOffer.finalPrice + remainingItems * item.currentPriceValue;
    }
    return quantity * item.currentPriceValue;
  }

  static calculateCartTotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  }
}
