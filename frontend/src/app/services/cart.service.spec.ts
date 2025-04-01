import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CartService } from './cart.service';
import { ItemService } from './item.service';
import { of } from 'rxjs';
import { Item } from '../models/item.model';
import { environment } from '../../environments/environment';
import { PriceCalculator } from '../utils/price-calculator';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;
  let itemServiceSpy: jasmine.SpyObj<ItemService>;

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
    const itemSpy = jasmine.createSpyObj('ItemService', ['loadItems'], {
      items$: of([mockItem1, mockItem2])
    });
    
    spyOn(PriceCalculator, 'calculateItemTotal').and.callThrough();
    spyOn(PriceCalculator, 'calculateCartTotal').and.callThrough();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CartService,
        { provide: ItemService, useValue: itemSpy },
      ]
    });
    
    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
    itemServiceSpy = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addToCart', () => {
    it('should add a new item to the cart', waitForAsync(() => {
      // When
      service.addToCart(mockItem1);
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(1);
        expect(cartItems[0].item).toEqual(mockItem1);
        expect(cartItems[0].quantity).toBe(1);
        expect(cartItems[0].totalPrice).toBe(10);
      });
    }));
    
    it('should increment quantity for existing item', waitForAsync(() => {
      // When
      service.addToCart(mockItem1);
      service.addToCart(mockItem1);
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(1);
        expect(cartItems[0].item).toEqual(mockItem1);
        expect(cartItems[0].quantity).toBe(2);
        expect(cartItems[0].totalPrice).toBe(20);
      });
    }));
  });

  describe('removeFromCart', () => {
    it('should decrement quantity for item with quantity > 1', waitForAsync(() => {
      // When
      service.addToCart(mockItem1);
      service.addToCart(mockItem1);
      service.removeFromCart(mockItem1);
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(1);
        expect(cartItems[0].item).toEqual(mockItem1);
        expect(cartItems[0].quantity).toBe(1);
        expect(cartItems[0].totalPrice).toBe(10);
      });
    }));
    
    it('should remove item from cart when quantity becomes 0', waitForAsync(() => {
      // Given
      service.addToCart(mockItem1);
      
      // When
      service.removeFromCart(mockItem1);
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(0);
      });
    }));
    
    it('should do nothing when trying to remove non-existent item', waitForAsync(() => {
      // When
      service.removeFromCart(mockItem1);
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(0);
      });
    }));
  });

  describe('clearCart', () => {
    it('should remove all items from the cart', waitForAsync(() => {
      // Given
      service.addToCart(mockItem1);
      service.addToCart(mockItem2);
      
      // When
      service.clearCart();
      
      // Then
      service.cartItems$.subscribe(cartItems => {
        expect(cartItems.length).toBe(0);
      });
    }));
  });

  describe('checkout', () => {
    it('should return error observable when cart is empty', waitForAsync(() => {
      // Given - Empty cart
      
      // When
      service.checkout().subscribe(response => {
        // Then
        expect(response.errorMessage).toBe('Your cart is empty');
        
        // Also verify the error subject was updated
        service.checkoutError$.subscribe(error => {
          expect(error.message).toBe('Your cart is empty');
          expect(error.itemWithPriceChange).toBeNull();
          expect(error.actualPrice).toBeNull();
        });
      });
    }));
    
    it('should send checkout request and handle successful response', waitForAsync(() => {
      // Given
      service.addToCart(mockItem1);
      
      // When
      service.checkout().subscribe(() => {
        // Then
        service.cartItems$.subscribe(cartItems => {
          expect(cartItems.length).toBe(0);
        });
      });
      
      // Handle the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/orders/checkout`);
      expect(req.request.method).toBe('POST');
      req.flush({ total: 10 });
    }));
  });

  describe('resetCheckoutError', () => {
    it('should reset the checkout error', waitForAsync(() => {
      // Given - This will set an empty cart error
      service.checkout().subscribe();
      
      // When
      service.resetCheckoutError();
      
      // Then - Check the checkoutError$ observable
      service.checkoutError$.subscribe(error => {
        expect(error.message).toBeNull();
        expect(error.itemWithPriceChange).toBeNull();
        expect(error.actualPrice).toBeNull();
      });
    }));
  });
});
