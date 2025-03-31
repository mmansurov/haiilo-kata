package de.haiilo.supermarket.domain;

import javax.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@MappedSuperclass
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public abstract class OfferSnapshot {
    private Integer quantity;
    private Integer discountPercentage; // Stored as whole number, e.g., 33 means 33%
}
