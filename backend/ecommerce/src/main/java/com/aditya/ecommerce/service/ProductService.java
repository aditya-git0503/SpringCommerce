package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.product.ProductResponseDTO;
import com.aditya.ecommerce.entity.Product;
import com.aditya.ecommerce.repo.ProductRepo;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepo productRepo;

    public ProductService(ProductRepo productRepo) {
        this.productRepo = productRepo;
    }

    private ProductResponseDTO mapToDTO(Product product){
        return new ProductResponseDTO(
                product.getProductId(),
                product.getProductName(),
                product.getPrice(),
                product.getStockAmount(),
                product.getImageUrl(),
                product.getTotalBuyers(),
                product.getAvgRating(),
                product.getDescription(),
                product.getCategory()
        );
    }

    public List<ProductResponseDTO> getAllProducts(){
        return productRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ProductResponseDTO getProductById(int id) throws Exception {
        Optional<Product> product = productRepo.findById(id);
        if(!product.isPresent())
            throw new Exception("Product not found");
        return mapToDTO(product.get());
    }

    public List<ProductResponseDTO> findByProductNameContainingIgnoreCase(String keyword){
        return productRepo.findByProductNameContainingIgnoreCase(keyword)
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> findByPriceBetween(float min, float max){
        return productRepo.findByPriceBetween(min, max)
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> getAvailableProducts(){
        return productRepo.findByStockAmountGreaterThan(0)
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> sortByPriceLowToHigh(){
        return productRepo.findAllByOrderByPriceAsc()
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> sortByPriceHighToLow(){
        return productRepo.findAllByOrderByPriceDesc()
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> findByRating(float rating){
        return productRepo.findByAvgRatingGreaterThanEqual(rating)
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public List<ProductResponseDTO> sortByRatingDesc(){
        return productRepo.findAllByOrderByAvgRatingDesc()
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }
}
