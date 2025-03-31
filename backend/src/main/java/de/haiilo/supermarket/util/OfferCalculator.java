package de.haiilo.supermarket.util;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Offer;

public final class OfferCalculator {

    // Calculate Offer price (for an offer quantity) when we receive a new price
    // Calculated from Offer's discountPercentage and rounded to the nearest 5 or 0 at the end
    public static Integer calculateOfferPrice(Item item) {
        if (item.getCurrentOffer() == null || item.getCurrentPrice() == null) {
            return null;
        }
        
        int basePrice = item.getCurrentPrice().getValue() * item.getCurrentOffer().getQuantity();
        int discountPercent = item.getCurrentOffer().getDiscountPercentage();
        int discountedPrice = basePrice * (100 - discountPercent) / 100;
        return Math.round(discountedPrice / 5.0f) * 5;
    }

    // Repeats on FrontEnd
    public static int calculateTotalPrice(Item item, int quantity) {
        if (item == null || item.getCurrentPrice() == null) {
            return 0;
        }
        
        int itemPrice = item.getCurrentPrice().getValue();
        Offer offer = item.getCurrentOffer();
        
        // If no offer or quantity is less than offer requirement, just multiply price by quantity
        if (offer == null || quantity < offer.getQuantity()) {
            return quantity * itemPrice;
        }
        
        // Use pre-calculated price - it should always exist if there's an offer
        int offerQuantity = offer.getQuantity();
        int offerSets = quantity / offerQuantity;
        int remainingItems = quantity % offerQuantity;
        
        return offerSets * item.getCurrentPrice().getCalculatedOfferPrice() + 
               remainingItems * itemPrice;
    }

    private OfferCalculator() {
    }
}
