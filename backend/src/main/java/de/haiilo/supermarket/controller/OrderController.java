package de.haiilo.supermarket.controller;

import de.haiilo.supermarket.dto.CheckoutRequest;
import de.haiilo.supermarket.dto.CheckoutResponse;
import de.haiilo.supermarket.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponse> checkout(@RequestBody CheckoutRequest request) {
        return ResponseEntity.ok(orderService.processCheckout(request));
    }
}