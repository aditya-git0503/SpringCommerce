package com.aditya.ecommerce.dto.product;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductResponseDTO {
    private int productId;
    private String productName;
    private float price;
    private int stockAmount;
    private String imageUrl;
    private int totalBuyers;
    private float avgRating;
    private String description;
}
