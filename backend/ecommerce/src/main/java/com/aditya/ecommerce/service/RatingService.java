package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.product.RateProductRequestDTO;
import com.aditya.ecommerce.entity.*;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class RatingService {
    private final ProductRatingRepo productRatingRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final OrderItemRepo orderItemRepo;

    public RatingService(ProductRatingRepo productRatingRepo, UserRepo userRepo, ProductRepo productRepo, OrderItemRepo orderItemRepo) {
        this.productRatingRepo = productRatingRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.orderItemRepo = orderItemRepo;
    }

    public void rateProduct(String email, RateProductRequestDTO request){
        User confirmedUser = userRepo.findByUserEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product confirmedProduct = productRepo.findById(request.getProductId()).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        OrderItem confirmedOrderItem = orderItemRepo.findById(request.getOrderItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Order item not found"));

        if (confirmedOrderItem.getOrder().getUser().getUserid() != confirmedUser.getUserid()) {
            throw new ForbiddenException("You can rate only your own purchased product");
        }

        if (confirmedOrderItem.getProduct().getProductId() != confirmedProduct.getProductId()) {
            throw new ForbiddenException("Selected order item does not match this product");
        }

        Optional<ProductRating> existingRating = productRatingRepo.findByOrderItem(confirmedOrderItem);
        if(existingRating.isPresent()){
            throw new ConflictException("You have already rated this purchase");
        }
        ProductRating ratingToSave = new ProductRating();
        ratingToSave.setUser(confirmedUser);
        ratingToSave.setProduct(confirmedProduct);
        ratingToSave.setOrderItem(confirmedOrderItem);
        ratingToSave.setRating(request.getRating());

        productRatingRepo.save(ratingToSave);

        int currentRatingCount = confirmedProduct.getRatingCount();
        float currentAverage = confirmedProduct.getAvgRating();
        float updatedAverage =
                ((currentAverage * currentRatingCount) + request.getRating())
                        / (currentRatingCount + 1);

        confirmedProduct.setAvgRating(updatedAverage);
        confirmedProduct.setRatingCount(currentRatingCount + 1);
        productRepo.save(confirmedProduct);
    }
}
