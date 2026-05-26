package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.product.RateProductRequestDTO;
import com.aditya.ecommerce.security.AuthUtil;
import com.aditya.ecommerce.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
public class RatingController {
    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }


    @PostMapping("/ratings")
    public String rateProduct(@RequestBody @Valid RateProductRequestDTO request) {
        String email = AuthUtil.getAuthenticatedEmail();
        ratingService.rateProduct(email, request);
        return "Rating updated successfully";
    }
}
