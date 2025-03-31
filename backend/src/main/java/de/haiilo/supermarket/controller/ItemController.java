package de.haiilo.supermarket.controller;

import de.haiilo.supermarket.dto.ItemDto;
import de.haiilo.supermarket.service.ItemService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {
    private final ItemService itemService;

    @GetMapping
    public List<ItemDto> getItems() {
        return itemService.getItems();
    }
}