package de.haiilo.supermarket.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Offer;
import de.haiilo.supermarket.domain.Price;
import de.haiilo.supermarket.dto.PriceDto;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.PriceRepository;
import java.util.Optional;
import javax.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PriceServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private PriceRepository priceRepository;

    private PriceService priceService;

    @BeforeEach
    void setUp() {
        priceService = new PriceService(itemRepository, priceRepository);
    }

    @Nested
    class createPriceAndUpdateItem {

        @Test
        void shouldThrowEntityNotFoundException_whenItemNotFound() {
            // Given
            Long itemId = 1L;
            PriceDto priceDto = PriceDto.builder()
                .itemId(itemId)
                .value(100)
                .build();

            when(itemRepository.findById(itemId)).thenReturn(Optional.empty());

            // When / Then
            assertThrows(EntityNotFoundException.class, () -> {
                priceService.createPriceAndUpdateItem(priceDto);
            });
        }

        @Test
        void shouldCreatePriceAndUpdateItem_whenNoOffer() {
            // Given
            Long itemId = 1L;
            Integer priceValue = 100;
            
            Item item = new Item();
            item.setId(itemId);
            item.setName("Test Item");
            item.setCurrentOffer(null);
            
            PriceDto priceDto = PriceDto.builder()
                .itemId(itemId)
                .value(priceValue)
                .build();

            when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));

            // When
            priceService.createPriceAndUpdateItem(priceDto);

            // Then
            ArgumentCaptor<Price> priceCaptor = ArgumentCaptor.forClass(Price.class);
            verify(priceRepository).save(priceCaptor.capture());
            
            Price savedPrice = priceCaptor.getValue();
            assertEquals(priceValue, savedPrice.getValue());
            assertEquals(item, savedPrice.getItem());
            assertNull(savedPrice.getCalculatedOfferPrice());
            
            ArgumentCaptor<Item> itemCaptor = ArgumentCaptor.forClass(Item.class);
            verify(itemRepository).save(itemCaptor.capture());
            
            Item savedItem = itemCaptor.getValue();
            assertEquals(savedPrice, savedItem.getCurrentPrice());
        }

        @Test
        void shouldCreatePriceWithCalculatedOfferPrice_whenOfferExists() {
            // Given
            Long itemId = 1L;
            Integer priceValue = 100;
            
            Item item = new Item();
            item.setId(itemId);
            item.setName("Test Item");
            
            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);
            
            PriceDto priceDto = PriceDto.builder()
                .itemId(itemId)
                .value(priceValue)
                .build();

            when(itemRepository.findById(itemId)).thenReturn(Optional.of(item));
            
            // When
            priceService.createPriceAndUpdateItem(priceDto);

            // Then
            ArgumentCaptor<Price> priceCaptor = ArgumentCaptor.forClass(Price.class);
            verify(priceRepository).save(priceCaptor.capture());
            
            Price savedPrice = priceCaptor.getValue();
            assertEquals(priceValue, savedPrice.getValue());
            assertEquals(item, savedPrice.getItem());
            assertEquals(240, savedPrice.getCalculatedOfferPrice());
            
            ArgumentCaptor<Item> itemCaptor = ArgumentCaptor.forClass(Item.class);
            verify(itemRepository).save(itemCaptor.capture());
            
            Item savedItem = itemCaptor.getValue();
            assertEquals(savedPrice, savedItem.getCurrentPrice());
        }
    }
}
