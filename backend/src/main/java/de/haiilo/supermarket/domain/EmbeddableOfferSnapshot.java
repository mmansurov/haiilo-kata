package de.haiilo.supermarket.domain;

import java.io.Serializable;
import javax.persistence.Embeddable;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder(toBuilder = true)
public class EmbeddableOfferSnapshot extends OfferSnapshot implements Serializable {
    private Long id;
}
