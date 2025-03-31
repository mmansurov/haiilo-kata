package de.haiilo.supermarket.service;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Price;
import de.haiilo.supermarket.dto.PriceDto;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.PriceRepository;
import de.haiilo.supermarket.util.OfferCalculator;
import javax.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
// TODO call in RabbitMQ listener when new price is published
public class PriceService {
    private final ItemRepository itemRepository;
    private final PriceRepository priceRepository;

    @Transactional
    public void createPriceAndUpdateItem(PriceDto priceDto) {
        Item item = itemRepository.findById(priceDto.itemId())
            .orElseThrow(() -> new EntityNotFoundException("Item not found with ID: " + priceDto.itemId()));

        Price newPrice = new Price();
        newPrice.setItem(item);
        newPrice.setValue(priceDto.value());
        item.setCurrentPrice(newPrice);

        if (item.getCurrentOffer() != null) {
            Integer calculatedPrice = OfferCalculator.calculateOfferPrice(item);
            newPrice.setCalculatedOfferPrice(calculatedPrice);
        }
        priceRepository.save(newPrice);
        itemRepository.save(item);
    }
}