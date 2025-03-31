package de.haiilo.supermarket.service;

import de.haiilo.supermarket.dto.ItemDto;
import de.haiilo.supermarket.mapper.ItemMapper;
import de.haiilo.supermarket.repository.ItemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ItemService {
    private final ItemRepository itemRepository;
    private final ItemMapper itemMapper;

    @Transactional(readOnly = true)
    public List<ItemDto> getItems() {
        // TODO Without Pageable just because it's an assessment task
        return itemRepository.findAll().stream()
            .map(itemMapper::toDto)
            .toList();
    }
}