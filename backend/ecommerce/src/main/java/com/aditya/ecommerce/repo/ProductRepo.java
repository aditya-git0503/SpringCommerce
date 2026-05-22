package com.aditya.ecommerce.repo;

import com.aditya.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepo extends JpaRepository<Product, Integer> {
    List<Product> findByPriceBetween(float min, float max);
    List<Product> findByStockAmountGreaterThan(int stock);
    List<Product> findByProductNameContainingIgnoreCase(String keyword);
    List<Product> findAllByOrderByPriceAsc();
    List<Product> findAllByOrderByPriceDesc();
    List<Product> findAllByOrderByAvgRatingDesc();
    List<Product> findByAvgRatingGreaterThanEqual(float rating);

}
