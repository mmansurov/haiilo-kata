import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { ItemService } from '../../services/item.service';
import { CartService } from '../../services/cart.service';
import { Item } from '../../models/item.model';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  readonly items$ = this.itemService.items$;
  readonly itemWithQuantity$ = combineLatest([this.items$, this.cartService.cartItems$]).pipe(
    map(([items, cartItems]) =>
      items.map(item => ({
        item,
        quantity: cartItems.find(ci => ci.item.id === item.id)?.quantity ?? 0
      }))
    )
  );

  constructor(
    private itemService: ItemService,
    private cartService: CartService,
  ) {
  }

  ngOnInit(): void {
    this.itemService.loadItems();
  }

  addToCart(item: Item): void {
    this.cartService.addToCart(item);
  }

  removeFromCart(item: Item): void {
    this.cartService.removeFromCart(item);
  }
}