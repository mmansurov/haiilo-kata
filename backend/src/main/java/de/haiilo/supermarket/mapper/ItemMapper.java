package de.haiilo.supermarket.mapper;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Offer;
import de.haiilo.supermarket.dto.ItemDto;
import de.haiilo.supermarket.dto.OfferDto;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public ItemDto toDto(Item item) {
        Offer currentOffer = item.getCurrentOffer();
        return new ItemDto(
            item.getId(),
            item.getName(),
            item.getCurrentPrice().getValue(),
            currentOffer != null
                ? new OfferDto(currentOffer.getQuantity(), item.getCurrentPrice().getCalculatedOfferPrice())
                : null
        );
    }
}
