package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.product.RateProductRequestDTO;
import com.aditya.ecommerce.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
public class RatingController {
    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }


    @PostMapping("/ratings")
    public String rateProduct(@RequestBody @Valid RateProductRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        ratingService.rateProduct(email, request);
        return "Rating updated successfully";
    }
}
