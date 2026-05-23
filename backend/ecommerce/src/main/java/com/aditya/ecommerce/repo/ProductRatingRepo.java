package com.aditya.ecommerce.repo;

import com.aditya.ecommerce.entity.Product;
import com.aditya.ecommerce.entity.ProductRating;
import com.aditya.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRatingRepo extends JpaRepository<ProductRating, Integer>{
    Optional<ProductRating> findByUserAndProduct(User user, Product product);
    List<ProductRating> findByProduct(Product product);
}
