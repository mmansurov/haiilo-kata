package de.haiilo.supermarket.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Offer;
import de.haiilo.supermarket.domain.Price;
import java.util.stream.Stream;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class OfferCalculatorTest {

    @Nested
    class calculateOfferPrice {

        @Test
        void shouldReturnNull_whenItemHasNoOffer() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(100);
            item.setCurrentPrice(price);
            item.setCurrentOffer(null);

            // When
            Integer result = OfferCalculator.calculateOfferPrice(item);

            // Then
            assertNull(result);
        }

        @Test
        void shouldReturnNull_whenItemHasNoPrice() {
            // Given
            Item item = new Item();
            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);
            item.setCurrentPrice(null);

            // When
            Integer result = OfferCalculator.calculateOfferPrice(item);

            // Then
            assertNull(result);
        }

        @ParameterizedTest
        @MethodSource
        void calculateOfferPriceWithRounding(int price, int quantity, int discount, int expected) {
            // Given
            Item item = new Item();
            Price itemPrice = new Price();
            itemPrice.setValue(price);
            item.setCurrentPrice(itemPrice);

            Offer offer = new Offer();
            offer.setQuantity(quantity);
            offer.setDiscountPercentage(discount);
            item.setCurrentOffer(offer);

            // When
            Integer result = OfferCalculator.calculateOfferPrice(item);

            // Then
            assertEquals(expected, result);
        }

        static Stream<Arguments> calculateOfferPriceWithRounding() {
            return Stream.of(
                // price, quantity, discount, expected result
                arguments(100, 3, 20, 240),
                arguments(50, 2, 10, 90),
                arguments(75, 4, 25, 225),
                arguments(60, 5, 30, 210),
                arguments(45, 2, 15, 75),
                arguments(33, 3, 10, 90),
                arguments(99, 2, 33, 130)
            );
        }
    }

    @Nested
    class calculateTotalPrice {

        @Test
        void shouldReturnZero_whenItemIsNull() {
            // When
            int result = OfferCalculator.calculateTotalPrice(null, 5);

            // Then
            assertEquals(0, result);
        }

        @Test
        void shouldReturnZero_whenItemHasNoPrice() {
            // Given
            Item item = new Item();
            item.setCurrentPrice(null);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 5);

            // Then
            assertEquals(0, result);
        }

        @Test
        void shouldCalculateRegularPrice_whenNoOffer() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(50);
            item.setCurrentPrice(price);
            item.setCurrentOffer(null);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 3);

            // Then
            assertEquals(150, result);
        }

        @Test
        void shouldCalculateRegularPrice_whenQuantityLessThanOfferQuantity() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(50);
            item.setCurrentPrice(price);

            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 2);

            // Then
            assertEquals(100, result);
        }

        @Test
        void shouldApplyOfferPrice_whenQuantityEqualsOfferQuantity() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(50);
            price.setCalculatedOfferPrice(120);
            item.setCurrentPrice(price);

            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 3);

            // Then
            assertEquals(120, result);
        }

        @Test
        void shouldApplyOfferPriceWithRemainingItemsAtRegularPrice() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(50);
            price.setCalculatedOfferPrice(120); // Pre-calculated offer price for 3 items
            item.setCurrentPrice(price);

            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 5);

            // Then
            assertEquals(220, result); // 1 offer set (120) + 2 regular items (100) = 220
        }

        @Test
        void shouldApplyMultipleOfferSets() {
            // Given
            Item item = new Item();
            Price price = new Price();
            price.setValue(50);
            price.setCalculatedOfferPrice(120); // Pre-calculated offer price for 3 items
            item.setCurrentPrice(price);

            Offer offer = new Offer();
            offer.setQuantity(3);
            offer.setDiscountPercentage(20);
            item.setCurrentOffer(offer);

            // When
            int result = OfferCalculator.calculateTotalPrice(item, 7);

            // Then
            assertEquals(290, result); // 2 offer sets (240) + 1 regular item (50) = 290
        }
    }
}
