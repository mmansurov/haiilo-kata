package de.haiilo.supermarket.config;

import de.haiilo.supermarket.domain.Item;
import de.haiilo.supermarket.domain.Offer;
import de.haiilo.supermarket.domain.Price;
import de.haiilo.supermarket.repository.ItemRepository;
import de.haiilo.supermarket.repository.OfferRepository;
import de.haiilo.supermarket.util.OfferCalculator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(ItemRepository itemRepository, OfferRepository offerRepository) {
        return args -> {
            // Apple
            var apple = new Item();
            apple.setName("Apple");

            var applePrice = new Price();
            applePrice.setValue(30);
            applePrice.setItem(apple);
            apple.setCurrentPrice(applePrice);
            apple.getPrices().add(applePrice);
            apple = itemRepository.save(apple);

            var appleOffer = new Offer();
            appleOffer.setQuantity(2);
            appleOffer.setDiscountPercentage(25); // 25% off when buying 2
            appleOffer.setItem(apple);
            appleOffer = offerRepository.save(appleOffer);
            apple.setCurrentOffer(appleOffer);
            apple.getOffers().add(appleOffer);

            Integer appleOfferPrice = OfferCalculator.calculateOfferPrice(apple);
            applePrice.setCalculatedOfferPrice(appleOfferPrice);
            itemRepository.save(apple);

            // Banana
            var banana = new Item();
            banana.setName("Banana");

            var bananaPrice = new Price();
            bananaPrice.setValue(50);
            bananaPrice.setItem(banana);
            banana.setCurrentPrice(bananaPrice);
            banana.getPrices().add(bananaPrice);
            banana = itemRepository.save(banana);

            var bananaOffer = new Offer();
            bananaOffer.setQuantity(3);
            bananaOffer.setDiscountPercentage(15);  // 15% off when buying 3
            bananaOffer.setItem(banana);
            bananaOffer = offerRepository.save(bananaOffer);
            banana.setCurrentOffer(bananaOffer);
            banana.getOffers().add(bananaOffer);

            Integer bananaOfferPrice = OfferCalculator.calculateOfferPrice(banana);
            bananaPrice.setCalculatedOfferPrice(bananaOfferPrice);
            itemRepository.save(banana);

            // Peach
            var peach = new Item();
            peach.setName("Peach");

            var peachPrice = new Price();
            peachPrice.setValue(60);
            peachPrice.setItem(peach);
            peach.setCurrentPrice(peachPrice);
            peach.getPrices().add(peachPrice);
            itemRepository.save(peach);
        };
    }
}
