import { Item } from './item.model';

export interface CartItem {
  item: Item;
  quantity: number;
  totalPrice?: number;
}

export interface CheckoutRequest {
  items: CartItem[];
  total: number;
}

export interface CheckoutResponse {
  errorMessage?: string;
  itemIdWithPriceChange?: number;
  actualPrice?: number;
  total?: number;
}

export interface CheckoutError {
  message: string | null;
  itemWithPriceChange: Item | null;
  actualPrice: number | null;
}
