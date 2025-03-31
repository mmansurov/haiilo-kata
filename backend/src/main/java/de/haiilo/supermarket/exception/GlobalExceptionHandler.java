package de.haiilo.supermarket.exception;

import de.haiilo.supermarket.dto.CheckoutResponse;
import javax.persistence.EntityNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<CheckoutResponse> handleEntityNotFoundException(EntityNotFoundException ex) {
        CheckoutResponse response = CheckoutResponse.builder()
            .success(false)
            .errorMessage(ex.getMessage())
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    @ExceptionHandler(PriceChangedException.class)
    public ResponseEntity<CheckoutResponse> handlePriceChangedException(PriceChangedException ex) {
        CheckoutResponse response = CheckoutResponse.builder()
            .success(false)
            .errorMessage(ex.getMessage())
            .itemIdWithPriceChange(ex.getItemId())
            .actualPrice(ex.getActualPrice())
            .build();
        
        return ResponseEntity.ok(response);
    }
    
    @ExceptionHandler(TotalMismatchException.class)
    public ResponseEntity<CheckoutResponse> handleTotalMismatchException(TotalMismatchException ex) {
        CheckoutResponse response = CheckoutResponse.builder()
            .success(false)
            .errorMessage(ex.getMessage())
            .build();
        
        return ResponseEntity.ok(response);
    }
}
