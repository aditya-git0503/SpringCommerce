package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.product.RateProductRequestDTO;
import com.aditya.ecommerce.entity.*;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.*;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class RatingService {
    private final ProductRatingRepo productRatingRepo;
    private final UserRepo userRepo;
    private final ProductRepo productRepo;
    private final OrderRepo orderRepo;

    public RatingService(ProductRatingRepo productRatingRepo, UserRepo userRepo, ProductRepo productRepo, OrderRepo orderRepo) {
        this.productRatingRepo = productRatingRepo;
        this.userRepo = userRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
    }

    public void rateProduct(String email, RateProductRequestDTO request){
        User confirmedUser = userRepo.findByUserEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Product confirmedProduct = productRepo.findById(request.getProductId()).orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        List<Orders> orders = orderRepo.findByUser(confirmedUser);

        boolean hasPurchased = false;
        for(Orders o : orders){
            for(OrderItem item : o.getOrderItems()){
                if(item.getProduct().getProductId() == confirmedProduct.getProductId()){
                    hasPurchased = true;
                    break;
                }
            }
            if(hasPurchased)
                break;
        }

        if(!hasPurchased){
            throw new ForbiddenException("You can rate only purchased products!");
        }

        Optional<ProductRating> existingRating = productRatingRepo.findByUserAndProduct(confirmedUser, confirmedProduct);
        if(existingRating.isPresent()){
            throw new ConflictException("You have already rated this product");
        }
        ProductRating ratingToSave = new ProductRating();
        ratingToSave.setUser(confirmedUser);
        ratingToSave.setProduct(confirmedProduct);
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
        Set<Integer> buyerIds = new HashSet<>();

        for(Orders o : allOrders){
            boolean boughtThis = false;

            for(OrderItem item : o.getOrderItems()){
                if(item.getProduct().getProductId() == confirmedProduct.getProductId()){
                    boughtThis = true;
                    break;
                }
            }

            if(boughtThis)
                buyerIds.add(o.getUser().getUserid());

        }
        confirmedProduct.setTotalBuyers(buyerIds.size());
        productRepo.save(confirmedProduct);
    }
}
