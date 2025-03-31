package de.haiilo.supermarket.service;

import de.haiilo.supermarket.domain.EmbeddableOfferSnapshot;
import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Order;
import de.haiilo.supermarket.domain.OrderItem;
import de.haiilo.supermarket.domain.OrderStatus;
import de.haiilo.supermarket.dto.CheckoutRequest;
import de.haiilo.supermarket.dto.CheckoutResponse;
import de.haiilo.supermarket.exception.PriceChangedException;
import de.haiilo.supermarket.exception.TotalMismatchException;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.OrderRepository;
import de.haiilo.supermarket.util.OfferCalculator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ItemRepository itemRepository;
    private final OrderRepository orderRepository;

    @Transactional
    public CheckoutResponse processCheckout(CheckoutRequest request) {
        Map<Long, Item> itemsById = fetchItemsById(request);

        validatePrices(request, itemsById);

        int total = calculateTotal(request.items(), itemsById);
        validateTotal(request, total);

        Order order = createOrder(request, itemsById, total);
        orderRepository.save(order);

        return CheckoutResponse.builder()
            .success(true)
            .total(total)
            .build();
    }

    private Map<Long, Item> fetchItemsById(CheckoutRequest request) {
        return itemRepository.findAllById(
                request.items().stream()
                    .map(cartItem -> cartItem.item().id())
                    .collect(Collectors.toSet())
            ).stream()
            .collect(Collectors.toMap(Item::getId, Function.identity()));
    }

    // Verify FE prices match current prices in the db
    private void validatePrices(CheckoutRequest request, Map<Long, Item> itemsById) {
        for (CheckoutRequest.CartItem cartItem : request.items()) {
            Long itemId = cartItem.item().id();
            Item item = itemsById.get(itemId);
            int currentPrice = item.getCurrentPrice().getValue();
            Integer expectedPrice = cartItem.item().currentPriceValue();

            if (expectedPrice != null && !expectedPrice.equals(currentPrice)) {
                throw new PriceChangedException(item.getId(), item.getName(), currentPrice);
            }
        }
    }

    private void validateTotal(CheckoutRequest request, int calculatedTotal) {
        if (request.total() != null && !request.total().equals(calculatedTotal)) {
            throw new TotalMismatchException(request.total(), calculatedTotal);
        }
    }

    private Order createOrder(CheckoutRequest request, Map<Long, Item> itemsById, int total) {
        Order order = new Order();
        order.setStatus(OrderStatus.COMPLETED);
        order.setCompletedAt(LocalDateTime.now());
        order.setTotal(total);
        for (CheckoutRequest.CartItem cartItem : request.items()) {
            Item item = itemsById.get(cartItem.item().id());
            OrderItem orderItem = createOrderItem(order, item, cartItem.quantity());
            order.getItems().add(orderItem);
        }
        return order;
    }

    private OrderItem createOrderItem(Order order, Item item, int quantity) {
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setItem(item);
        orderItem.setQuantity(quantity);
        orderItem.setPriceSnapshot(item.getCurrentPrice().getValue());
        if (item.getCurrentOffer() != null) {
            orderItem.setOfferSnapshot(EmbeddableOfferSnapshot.builder()
                .id(item.getCurrentOffer().getId())
                .quantity(item.getCurrentOffer().getQuantity())
                .discountPercentage(item.getCurrentOffer().getDiscountPercentage())
                .build());
        }
        return orderItem;
    }

    private int calculateTotal(List<CheckoutRequest.CartItem> items, Map<Long, Item> itemsById) {
        return items.stream().mapToInt(cartItem -> {
            Item item = itemsById.get(cartItem.item().id());
            int quantity = cartItem.quantity();

            return OfferCalculator.calculateTotalPrice(item, quantity);
        }).sum();
    }
}