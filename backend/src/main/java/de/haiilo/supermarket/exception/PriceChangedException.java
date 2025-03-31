package de.haiilo.supermarket.exception;

import lombok.Getter;

@Getter
public class PriceChangedException extends RuntimeException {
    private final Long itemId;
    private final String itemName;
    private final Integer actualPrice;
    
    public PriceChangedException(Long itemId, String itemName, Integer actualPrice) {
        super("Price has changed for item: " + itemName);
        this.itemId = itemId;
        this.itemName = itemName;
        this.actualPrice = actualPrice;
    }
}
