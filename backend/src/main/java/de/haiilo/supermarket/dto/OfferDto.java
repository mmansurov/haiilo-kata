package de.haiilo.supermarket.dto;

import lombok.Builder;

@Builder
public record OfferDto(
    Integer quantity,
    Integer finalPrice
) {}
