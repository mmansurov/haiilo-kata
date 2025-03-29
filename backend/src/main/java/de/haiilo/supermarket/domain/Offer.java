package de.haiilo.supermarket.domain;

import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;

@Entity
@Table(name = "offers", indexes = {
    @Index(name = "idx_offers_item_createdAt", columnList = "item_id,effective_from DESC"),
})
@Getter
@Setter
public class Offer extends OfferSnapshot implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Offer)) return false;
        return id != null && id.equals(((Offer) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
