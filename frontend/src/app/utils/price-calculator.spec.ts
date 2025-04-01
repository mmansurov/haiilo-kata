import { Item } from '../models/item.model';
import { CartItem } from '../models/cart.model';
import { PriceCalculator } from './price-calculator';

describe('PriceCalculator', () => {
  // Define items based on DataInitializer.java
  const apple: Item = {
    id: 1,
    name: 'Apple',
    currentPriceValue: 30,
    currentOffer: {
      quantity: 2,
      finalPrice: 45
    }
  };

  const banana: Item = {
    id: 2,
    name: 'Banana',
    currentPriceValue: 50,
    currentOffer: {
      quantity: 3,
      finalPrice: 130
    }
  };

  const peach: Item = {
    id: 3,
    name: 'Peach',
    currentPriceValue: 60,
    currentOffer: null
  };

  describe('calculateItemTotal', () => {
    it('should calculate regular price when no offer is available', () => {
      // When
      const result = PriceCalculator.calculateItemTotal(peach, 3);
      
      // Then
      expect(result).toBe(180);
    });

    it('should calculate regular price when quantity is less than offer quantity', () => {
      // When
      const result = PriceCalculator.calculateItemTotal(apple, 1);
      
      // Then
      expect(result).toBe(30);
    });

    it('should apply offer when quantity equals offer quantity', () => {
      // When
      const result = PriceCalculator.calculateItemTotal(apple, 2);
      
      // Then
      expect(result).toBe(45);
    });

    it('should apply offer and regular price for mixed quantities', () => {
      // When
      const result = PriceCalculator.calculateItemTotal(apple, 5);
      
      // Then
      expect(result).toBe(120);
    });

    it('should apply multiple offer sets correctly', () => {
      // When
      const result = PriceCalculator.calculateItemTotal(banana, 7);
      
      // Then
      expect(result).toBe(310);
    });
  });

  describe('calculateCartTotal', () => {
    it('should calculate total of all cart items', () => {
      // Given
      const cartItems: CartItem[] = [
        {
          item: apple,
          quantity: 2,
          totalPrice: 45
        },
        {
          item: banana,
          quantity: 3,
          totalPrice: 130
        },
        {
          item: peach,
          quantity: 1,
          totalPrice: 60
        }
      ];
      
      // When
      const result = PriceCalculator.calculateCartTotal(cartItems);
      
      // Then
      expect(result).toBe(235);
    });

    it('should handle empty cart', () => {
      // When
      const result = PriceCalculator.calculateCartTotal([]);
      
      // Then
      expect(result).toBe(0);
    });

    it('should handle items with undefined totalPrice', () => {
      // Given
      const cartItems: CartItem[] = [
        {
          item: apple,
          quantity: 2,
          totalPrice: undefined
        }
      ];
      
      // When
      const result = PriceCalculator.calculateCartTotal(cartItems);
      
      // Then
      expect(result).toBe(0);
    });
  });
});
