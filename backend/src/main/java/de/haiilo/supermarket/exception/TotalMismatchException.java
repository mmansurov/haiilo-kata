package de.haiilo.supermarket.exception;

import lombok.Getter;

@Getter
public class TotalMismatchException extends RuntimeException {
    private final Integer expectedTotal;
    private final Integer actualTotal;
    
    public TotalMismatchException(Integer expectedTotal, Integer actualTotal) {
        super("Total price mismatch. Expected: " + expectedTotal + ", Actual: " + actualTotal);
        this.expectedTotal = expectedTotal;
        this.actualTotal = actualTotal;
    }
}
