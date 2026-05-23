package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.product.RateProductRequestDTO;
import com.aditya.ecommerce.entity.*;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RatingService {
    private final ProductRatingRepo productRatingRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;

    public RatingService(ProductRatingRepo productRatingRepo, UserRepo userRepo, ProductRepo productRepo, OrderRepo orderRepo, OrderItemRepo orderItemRepo) {
        this.productRatingRepo = productRatingRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
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

        List<ProductRating> allRatings = productRatingRepo.findByProduct(confirmedProduct);

        int total = 0;
        for(ProductRating r : allRatings){
            total += r.getRating();
        }

        float avg = 0;
        if(!allRatings.isEmpty()){
            avg = (float) total/allRatings.size();
        }

        confirmedProduct.setAvgRating(avg);

        List<Orders> allOrders = orderRepo.findAll();
        int totalBuys = 0;

        for(Orders o : allOrders){
            boolean boughtThis = false;

            for(OrderItem item : o.getOrderItems()){
                if(item.getProduct().getProductId() == confirmedProduct.getProductId()){
                    boughtThis = true;
                    break;
                }
            }

            if(boughtThis)
                totalBuys++;

        }
        confirmedProduct.setTotalBuyers(totalBuys);
        productRepo.save(confirmedProduct);
    }
}
