package com.aditya.ecommerce.dto.product;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RateProductRequestDTO {
    private int productId;

    @Min(1)
    @Max(5)
    private int rating;
}
