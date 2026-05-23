package com.aditya.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private int productId;

    @Column(name = "product_name")
    private String productName;

    private float price;

    @PositiveOrZero(message = "Stock amount cannot be negative")
    @Column(name = "stock_amount")
    private int stockAmount;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "total_buyers")
    private int totalBuyers;

    @Column(name = "avg_rating")
    private float avgRating;

    @Column(name = "rating_count")
    private int ratingCount;

    private String description;

    @Column(name = "category")
    private String category;
}
