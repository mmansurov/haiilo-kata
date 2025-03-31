package de.haiilo.supermarket.dto;

import lombok.Builder;

@Builder
public record CheckoutResponse(
    boolean success,
    String errorMessage,
    Integer total,
    Integer actualPrice,
    Long itemIdWithPriceChange
) {}
