package com.aditya.ecommerce.dto.cart;

import com.aditya.ecommerce.entity.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartResponseDTO {
    private int cartId;
    private int quantity;
    private int productId;
    private String productName;
    private float price;
    private String imageUrl;
    private int stockAmount;
}
