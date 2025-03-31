package de.haiilo.supermarket.dto;

import java.util.List;

public record CheckoutRequest(
    List<CartItem> items,
    Integer total
) {
    public record CartItem(
        ItemDto item,
        Integer quantity
    ) {}
}
