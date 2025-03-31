package de.haiilo.supermarket.dto;

import lombok.Builder;

@Builder
public record PriceDto(
    Long itemId,
    Integer value
) {}
