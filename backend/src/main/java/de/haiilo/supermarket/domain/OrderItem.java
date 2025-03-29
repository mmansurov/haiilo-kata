package de.haiilo.supermarket.domain;

import java.io.Serializable;
import lombok.Getter;
import lombok.Setter;
import javax.persistence.*;

@Entity
@Getter
@Setter
public class OrderItem implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Order order;

    @ManyToOne
    private Item item;

    private Integer quantity;

    private Integer priceSnapshot;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "id", column = @Column(name = "offer_snapshot_id")),
        @AttributeOverride(name = "quantity", column = @Column(name = "offer_snapshot_quantity")),
        @AttributeOverride(name = "discountPercentage",
            column = @Column(name = "offer_snapshot_discountPercentage"))
    })
    private EmbeddableOfferSnapshot offerSnapshot;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof OrderItem)) return false;
        return id != null && id.equals(((OrderItem) o).id);
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }
}
