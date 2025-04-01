import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { ItemService } from './item.service';
import { PriceCalculatorService } from './price-calculator.service';
import { Item } from '../models/item.model';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let itemServiceSpy: jasmine.SpyObj<ItemService>;
  let priceCalculatorSpy: jasmine.SpyObj<PriceCalculatorService>;

  const mockItem1: Item = {
    id: 1,
    name: 'Test Item 1',
    currentPriceValue: 10,
    currentOffer: null
  };

  const mockItem2: Item = {
    id: 2,
    name: 'Test Item 2',
    currentPriceValue: 15,
    currentOffer: {
      quantity: 3,
      finalPrice: 40
    }
  };

  beforeEach(() => {
    const itemSpy = jasmine.createSpyObj('ItemService', ['getItemsValue', 'loadItems'], {
      items$: of([mockItem1, mockItem2])
    });
    
    const calculatorSpy = jasmine.createSpyObj('PriceCalculatorService', [
      'calculateItemTotal',
      'calculateCartTotal'
    ]);
    
    // Set up default behavior for the calculator spy
    calculatorSpy.calculateItemTotal.and.callFake((item, quantity) => item.currentPriceValue * quantity);
    calculatorSpy.calculateCartTotal.and.callFake((items) => 
      items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    );

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: ItemService, useValue: itemSpy },
        { provide: PriceCalculatorService, useValue: calculatorSpy }
      ]
    });
    
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    itemServiceSpy = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    priceCalculatorSpy = TestBed.inject(PriceCalculatorService) as jasmine.SpyObj<PriceCalculatorService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addToCart', () => {
    it('should add a new item to the cart', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValue(10);
      
      // When
      service.addToCart(mockItem1);
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].item).toEqual(mockItem1);
      expect(cartItems[0].quantity).toBe(1);
      expect(cartItems[0].totalPrice).toBe(10);
      expect(priceCalculatorSpy.calculateItemTotal).toHaveBeenCalledWith(mockItem1, 1);
    });
    
    it('should increment quantity for existing item', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValues(10, 20);
      
      // When
      service.addToCart(mockItem1);
      service.addToCart(mockItem1);
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].item).toEqual(mockItem1);
      expect(cartItems[0].quantity).toBe(2);
      expect(cartItems[0].totalPrice).toBe(20);
      expect(priceCalculatorSpy.calculateItemTotal).toHaveBeenCalledWith(mockItem1, 2);
    });
  });

  describe('removeFromCart', () => {
    it('should decrement quantity for item with quantity > 1', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValues(10, 20, 10);
      
      // When
      service.addToCart(mockItem1);
      service.addToCart(mockItem1);
      service.removeFromCart(mockItem1);
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(1);
      expect(cartItems[0].item).toEqual(mockItem1);
      expect(cartItems[0].quantity).toBe(1);
      expect(cartItems[0].totalPrice).toBe(10);
      expect(priceCalculatorSpy.calculateItemTotal).toHaveBeenCalledWith(mockItem1, 1);
    });
    
    it('should remove item from cart when quantity becomes 0', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValue(10);
      service.addToCart(mockItem1);
      
      // When
      service.removeFromCart(mockItem1);
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(0);
    });
    
    it('should do nothing when trying to remove non-existent item', () => {
      // Given, Empty cart

      // When
      service.removeFromCart(mockItem1);
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValues(10, 15);
      service.addToCart(mockItem1);
      service.addToCart(mockItem2);
      
      // When
      service.clearCart();
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(0);
    });
  });

  describe('checkout', () => {
    it('should return error observable when cart is empty', () => {
      // Given, Empty cart

      // When
      service.checkout().subscribe();
      
      // Then - Get the current value directly from the subject
      const error = (service as any).checkoutErrorSubject.getValue();
      expect(error.message).toBe('Your cart is empty');
    });
    
    it('should send checkout request and handle successful response', () => {
      // Given
      priceCalculatorSpy.calculateItemTotal.and.returnValue(10);
      priceCalculatorSpy.calculateCartTotal.and.returnValue(10);
      service.addToCart(mockItem1);
      itemServiceSpy.getItemsValue.and.returnValue([mockItem1, mockItem2]);
      
      // When
      service.checkout().subscribe();
      const req = httpMock.expectOne(`${environment.apiUrl}/orders/checkout`);
      req.flush({
        success: true,
        total: 10
      });
      
      // Then - Get the current value directly from the subject
      const cartItems = (service as any).cartItemsSubject.getValue();
      expect(cartItems.length).toBe(0);
    });
  });

  describe('resetCheckoutError', () => {
    it('should reset the checkout error', () => {
      // Given
      service.checkout().subscribe();
      
      // When
      service.resetCheckoutError();
      
      // Then - Get the current value directly from the subject
      const error = (service as any).checkoutErrorSubject.getValue();
      expect(error.message).toBeNull();
      expect(error.itemWithPriceChange).toBeNull();
      expect(error.actualPrice).toBeNull();
    });
  });
});
