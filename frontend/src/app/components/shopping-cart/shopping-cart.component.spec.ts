import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingCartComponent } from './shopping-cart.component';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';
import { of } from 'rxjs';
import { Item } from '../../models/item.model';
import { CartItem, CheckoutError } from '../../models/cart.model';

describe('ShoppingCartComponent', () => {
  let component: ShoppingCartComponent;
  let fixture: ComponentFixture<ShoppingCartComponent>;
  let itemServiceSpy: jasmine.SpyObj<ItemService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;

  const mockItems: Item[] = [
    {
      id: 1,
      name: 'Test Item 1',
      currentPriceValue: 10,
      currentOffer: null
    },
    {
      id: 2,
      name: 'Test Item 2',
      currentPriceValue: 15,
      currentOffer: {
        quantity: 3,
        finalPrice: 40
      }
    }
  ];

  const mockCartItems: CartItem[] = [
    {
      item: mockItems[0],
      quantity: 2,
      totalPrice: 20
    }
  ];

  const mockCheckoutError: CheckoutError = {
    message: null,
    itemWithPriceChange: null,
    actualPrice: null
  };

  beforeEach(async () => {
    const itemSpy = jasmine.createSpyObj('ItemService', ['loadItems']);
    
    const cartSpy = jasmine.createSpyObj('CartService', 
      ['checkout', 'resetCheckoutError'],
      {
        cartItems$: of(mockCartItems),
        total$: of(20),
        checkoutError$: of(mockCheckoutError)
      }
    );
    
    cartSpy.checkout.and.returnValue(of({ total: 20 }));

    await TestBed.configureTestingModule({
      declarations: [ShoppingCartComponent],
      providers: [
        { provide: ItemService, useValue: itemSpy },
        { provide: CartService, useValue: cartSpy }
      ],
    })
    .compileComponents();

    itemServiceSpy = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    cartServiceSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShoppingCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display cart items', () => {
    component.cartItems$.subscribe(items => {
      expect(items).toEqual(mockCartItems);
    });
  });

  it('should display total', () => {
    component.total$.subscribe(total => {
      expect(total).toBe(20);
    });
  });

  it('should call checkout service when checkout button is clicked', () => {
    // When
    component.checkout();
    
    // Then
    expect(cartServiceSpy.checkout).toHaveBeenCalled();
  });

  it('should refresh prices and reset checkout error', () => {
    // When
    component.refreshPrices();
    
    // Then
    expect(itemServiceSpy.loadItems).toHaveBeenCalled();
    expect(cartServiceSpy.resetCheckoutError).toHaveBeenCalled();
  });

  it('should clean up subscriptions on destroy', () => {
    // Given
    spyOn(component['destroy$'], 'next');
    spyOn(component['destroy$'], 'complete');
    
    // When
    component.ngOnDestroy();
    
    // Then
    expect(component['destroy$'].next).toHaveBeenCalled();
    expect(component['destroy$'].complete).toHaveBeenCalled();
  });
});
