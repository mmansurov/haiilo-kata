package de.haiilo.supermarket.domain;

import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "prices", indexes = {
    @Index(name = "idx_prices_item_createdAt", columnList = "item_id,created_at DESC"),
})
@Getter
@Setter
public class Price {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    // The simplification that we work only with whole prices.
    private Integer value;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Price)) return false;
        return id != null && id.equals(((Price) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
