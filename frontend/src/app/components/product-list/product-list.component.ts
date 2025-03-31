import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ItemService } from '../../services/item.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  readonly items$ = this.itemService.items$;

  constructor(
    private itemService: ItemService,
  ) {
  }

  ngOnInit(): void {
    this.itemService.loadItems();
  }
}