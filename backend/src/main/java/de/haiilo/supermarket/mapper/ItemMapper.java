package de.haiilo.supermarket.mapper;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.dto.ItemDto;
import org.springframework.stereotype.Component;

@Component
public class ItemMapper {

    public ItemDto toDto(Item item) {
        return new ItemDto(
            item.getId(),
            item.getName(),
            item.getCurrentPrice().getValue(),
            // TODO get or calculate Offer?
            null
        );
    }
}
