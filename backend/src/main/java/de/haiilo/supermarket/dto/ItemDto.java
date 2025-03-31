package de.haiilo.supermarket.dto;

import lombok.Builder;

@Builder
public record ItemDto(
    Long id,
    String name,
    Integer currentPriceValue,
    OfferDto currentOffer
) {}
