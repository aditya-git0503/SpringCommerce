package com.aditya.ecommerce.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponseDTO {
    private int orderItemId;

    private int productId;
    private String productName;

    private int quantity;

    private float priceAtPurchase;

    private String imageUrl;
    private String description;
    private Integer userRating;
}
