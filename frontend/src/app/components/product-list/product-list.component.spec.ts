import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductListComponent } from './product-list.component';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';
import { of } from 'rxjs';
import { Item } from '../../models/item.model';
import { CartItem } from '../../models/cart.model';

describe('ProductListComponent', () => {
  let component: ProductListComponent;
  let fixture: ComponentFixture<ProductListComponent>;
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

  beforeEach(async () => {
    const itemSpy = jasmine.createSpyObj('ItemService', ['loadItems'], {
      items$: of(mockItems)
    });
    
    const cartSpy = jasmine.createSpyObj('CartService', ['addToCart', 'removeFromCart'], {
      cartItems$: of(mockCartItems)
    });

    await TestBed.configureTestingModule({
      declarations: [ProductListComponent],
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
    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load items on init', () => {
    expect(itemServiceSpy.loadItems).toHaveBeenCalled();
  });

  it('should combine items with cart quantities', (done) => {
    // When
    component.itemWithQuantity$.subscribe(items => {
      // Then
      expect(items.length).toBe(2);
      expect(items[0].item).toEqual(mockItems[0]);
      expect(items[0].quantity).toBe(2); // From cart
      expect(items[1].item).toEqual(mockItems[1]);
      expect(items[1].quantity).toBe(0); // Not in cart
      done();
    });
  });

  it('should call addToCart when adding an item', () => {
    // When
    component.addToCart(mockItems[1]);
    
    // Then
    expect(cartServiceSpy.addToCart).toHaveBeenCalledWith(mockItems[1]);
  });

  it('should call removeFromCart when removing an item', () => {
    // When
    component.removeFromCart(mockItems[0]);
    
    // Then
    expect(cartServiceSpy.removeFromCart).toHaveBeenCalledWith(mockItems[0]);
  });
});
