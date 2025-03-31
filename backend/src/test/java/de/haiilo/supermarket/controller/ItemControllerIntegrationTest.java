package de.haiilo.supermarket.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.haiilo.supermarket.config.DataInitializer;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.OfferRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ItemControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() throws Exception {
        itemRepository.deleteAll();
        dataInitializer.initData(itemRepository, offerRepository).run();
    }

    @Nested
    class getItems {
        @Test
        void success() throws Exception {
            mockMvc.perform(get("/api/items")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].name", is("Apple")))
                .andExpect(jsonPath("$[0].currentPriceValue", is(30)))
                .andExpect(jsonPath("$[0].currentOffer.quantity", is(2)))
                .andExpect(jsonPath("$[0].currentOffer.finalPrice", is(45)))
                .andExpect(jsonPath("$[1].name", is("Banana")))
                .andExpect(jsonPath("$[1].currentPriceValue", is(50)))
                .andExpect(jsonPath("$[1].currentOffer.quantity", is(3)))
                .andExpect(jsonPath("$[1].currentOffer.finalPrice", is(125)))
                .andExpect(jsonPath("$[2].name", is("Peach")))
                .andExpect(jsonPath("$[2].currentPriceValue", is(60)))
                .andExpect(jsonPath("$[2].currentOffer").doesNotExist());
        }

        @Test
        void noItemsInDatabase() throws Exception {
            itemRepository.deleteAll();

            mockMvc.perform(get("/api/items")
                    .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
        }
    }
}
