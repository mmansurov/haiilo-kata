package de.haiilo.supermarket.dto;

import lombok.Builder;

@Builder
public record CheckoutResponse(
    String errorMessage,
    Integer total,
    Integer actualPrice,
    Long itemIdWithPriceChange
) {}
