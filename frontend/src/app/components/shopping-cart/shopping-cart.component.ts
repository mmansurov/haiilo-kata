import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShoppingCartComponent {
  readonly cartItems$ = this.cartService.cartItems$;
  readonly total$ = this.cartService.total$;


  constructor(
    private cartService: CartService
  ) {
  }

  checkout(): void {

  }

}