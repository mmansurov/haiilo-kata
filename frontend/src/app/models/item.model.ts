export interface Offer {
  quantity: number;
  finalPrice: number;
}

export interface Item {
  id: number;
  name: string;
  currentPriceValue: number;
  currentOffer: Offer;
}
