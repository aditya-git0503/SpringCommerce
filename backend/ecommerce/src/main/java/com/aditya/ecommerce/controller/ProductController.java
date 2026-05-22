package com.aditya.ecommerce.controller;
import com.aditya.ecommerce.dto.product.ProductResponseDTO;
import com.aditya.ecommerce.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/products")
    public List<ProductResponseDTO> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/products/{id}")
    public ProductResponseDTO getProductById(@PathVariable int id) throws Exception {
        return productService.getProductById(id);
    }

    @GetMapping("/products/search")
    public List<ProductResponseDTO> searchProducts(@RequestParam String keyword){
        return productService.findByProductNameContainingIgnoreCase(keyword);
    }

    @GetMapping("/products/filter")
    public List<ProductResponseDTO> priceFilter(@RequestParam float minPrice, @RequestParam float maxPrice){
        return productService.findByPriceBetween(minPrice, maxPrice);
    }

    @GetMapping("/products/available")
    public List<ProductResponseDTO> getAvailableProducts(){
        return productService.getAvailableProducts();
    }

    @GetMapping("/products/sort/price-asc")
    public List<ProductResponseDTO> sortByPriceLowToHigh(){
        return productService.sortByPriceLowToHigh();
    }

    @GetMapping("/products/sort/price-desc")
    public List<ProductResponseDTO> sortByPriceHighToLow(){
        return productService.sortByPriceHighToLow();
    }

    @GetMapping("/products/rating")
    public List<ProductResponseDTO> findByRating(@RequestParam float minRating){
        return productService.findByRating(minRating);
    }

    @GetMapping("/products/sort/rating")
    public List<ProductResponseDTO> sortByRating(){
        return productService.sortByRatingDesc();
    }
}
