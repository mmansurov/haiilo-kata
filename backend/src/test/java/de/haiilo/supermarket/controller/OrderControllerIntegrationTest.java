package de.haiilo.supermarket.controller;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import de.haiilo.supermarket.config.DataInitializer;
import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.dto.CheckoutRequest;
import de.haiilo.supermarket.dto.ItemDto;
import de.haiilo.supermarket.dto.OfferDto;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.OfferRepository;
import de.haiilo.supermarket.repository.OrderRepository;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ItemRepository itemRepository;
    @Autowired
    private OfferRepository offerRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private DataInitializer dataInitializer;

    private Item apple;
    private Item banana;

    @BeforeEach
    void setUp() throws Exception {
        orderRepository.deleteAll();
        itemRepository.deleteAll();

        dataInitializer.initData(itemRepository, offerRepository).run();

        List<Item> items = itemRepository.findAll();
        apple = items.get(0);  // First item in dataInitialized (Apple)
        banana = items.get(1); // Second item in dataInitialized (Banana)
    }

    @Nested
    class checkout {
        @Test
        void success() throws Exception {
            // Given
            var request = new CheckoutRequest(
                List.of(
                    new CheckoutRequest.CartItem(
                        ItemDto.builder()
                            .id(apple.getId())
                            .name(apple.getName())
                            .currentPriceValue(apple.getCurrentPrice().getValue())
                            .currentOffer(OfferDto.builder()
                                .quantity(apple.getCurrentOffer().getQuantity())
                                .finalPrice(45)
                                .build())
                            .build(),
                        2
                    ),
                    new CheckoutRequest.CartItem(
                        ItemDto.builder()
                            .id(banana.getId())
                            .name(banana.getName())
                            .currentPriceValue(banana.getCurrentPrice().getValue())
                            .currentOffer(OfferDto.builder()
                                .quantity(banana.getCurrentOffer().getQuantity())
                                .finalPrice(125)
                                .build())
                            .build(),
                        3
                    )
                ),
                170
            );

            // When
            ResultActions result = mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Then
            result
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total", is(170)))
                .andExpect(jsonPath("$.errorMessage").doesNotExist())
                .andExpect(jsonPath("$.itemIdWithPriceChange").doesNotExist());
        }

        @Test
        void priceChanged() throws Exception {
            // Given
            var request = new CheckoutRequest(
                List.of(
                    new CheckoutRequest.CartItem(
                        ItemDto.builder()
                            .id(apple.getId())
                            .name(apple.getName())
                            .currentPriceValue(20) // Incorrect price (actual is 30)
                            .currentOffer(OfferDto.builder()
                                .quantity(apple.getCurrentOffer().getQuantity())
                                .finalPrice(30)
                                .build())
                            .build(),
                        2
                    )
                ),
                30
            );

            // When
            ResultActions result = mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Then
            result
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorMessage", is("Price has changed for item: Apple")))
                .andExpect(jsonPath("$.itemIdWithPriceChange", is(apple.getId().intValue())))
                .andExpect(jsonPath("$.actualPrice", is(30)));
        }

        @Test
        void totalMismatch() throws Exception {
            // Given
            CheckoutRequest request = new CheckoutRequest(
                List.of(
                    new CheckoutRequest.CartItem(
                        ItemDto.builder()
                            .id(apple.getId())
                            .name(apple.getName())
                            .currentPriceValue(apple.getCurrentPrice().getValue())
                            .currentOffer(OfferDto.builder()
                                .quantity(apple.getCurrentOffer().getQuantity())
                                .finalPrice(45)
                                .build())
                            .build(),
                        2
                    )
                ),
                50 // Incorrect total (actual is 45)
            );

            // When
            ResultActions result = mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Then
            result
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorMessage", is("Total price mismatch. Expected: 50, Actual: 45")))
                .andExpect(jsonPath("$.itemIdWithPriceChange").doesNotExist());
        }

        @Test
        void entityNotFound() throws Exception {
            var request = new CheckoutRequest(
                List.of(
                    new CheckoutRequest.CartItem(
                        ItemDto.builder()
                            .id(999L) // Non-existent item ID
                            .name("Non-existent")
                            .currentPriceValue(100)
                            .build(),
                        1
                    )
                ),
                100
            );

            // When
            ResultActions result = mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

            // Then
            result
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.errorMessage", is("An unexpected error occurred")));
        }
    }
}
