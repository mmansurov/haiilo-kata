import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingCartComponent implements OnDestroy {
  readonly cartItems$ = this.cartService.cartItems$;
  readonly total$ = this.cartService.total$;
  readonly checkoutError$ = this.cartService.checkoutError$;

  private destroy$ = new Subject<void>();

  constructor(
    private itemService: ItemService,
    private cartService: CartService
  ) {
  }

  checkout(): void {
    this.cartService.checkout()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  refreshPrices(): void {
    this.itemService.loadItems();
    this.cartService.resetCheckoutError();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}