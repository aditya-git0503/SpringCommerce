package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.entity.CartItem;
import com.aditya.ecommerce.entity.Product;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.exception.BadRequestException;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.CartItemRepo;
import com.aditya.ecommerce.repo.ProductRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepo cartItemRepo;
    private final ProductRepo productRepo;

    public CartService(CartItemRepo cartItemRepo, ProductRepo productRepo) {
        this.cartItemRepo = cartItemRepo;
        this.productRepo = productRepo;
    }

    private CartResponseDTO mapToDTO(CartItem item){
        return new CartResponseDTO(
                item.getCartId(),
                item.getQuantity(),
                item.getProduct().getProductId(),
                item.getProduct().getProductName(),
                item.getProduct().getPrice(),
                item.getProduct().getImageUrl(),
                item.getProduct().getStockAmount()
        );
    }

    public String addToCart(User user, int productId, int quantity){

        Product confirmedProduct = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        if (quantity <= 0) {
            throw new BadRequestException("Quantity should be greater than 0");
        }

        Optional<CartItem> cartItem =
                cartItemRepo.findByUserAndProduct(user, confirmedProduct);

        if(cartItem.isPresent()){

            CartItem existingItem = cartItem.get();
            int nextQuantity = existingItem.getQuantity() + quantity;
            if (nextQuantity > confirmedProduct.getStockAmount()) {
                throw new ConflictException("Requested quantity exceeds available stock");
            }

            existingItem.setQuantity(nextQuantity);

            cartItemRepo.save(existingItem);
        }

        else{
            if (quantity > confirmedProduct.getStockAmount()) {
                throw new ConflictException("Requested quantity exceeds available stock");
            }

            CartItem newCartItem = new CartItem();

            newCartItem.setUser(user);
            newCartItem.setProduct(confirmedProduct);
            newCartItem.setQuantity(quantity);

            cartItemRepo.save(newCartItem);
        }

        return "Product Added to Cart!";
    }

    public List<CartResponseDTO> getCartItems(User user){

        return cartItemRepo.findByUserOrderByCartIdAsc(user)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public String removeFromCart(User user, int cartId) {

        CartItem cartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (cartItem.getUser().getUserid() != user.getUserid()) {
            throw new ForbiddenException("Unauthorized cart access");
        }

        cartItemRepo.delete(cartItem);

        return "Item removed from cart";
    }

    public String updateQuantity(User user, int cartId, int quantity) {

        CartItem existingCartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart Item not found"));
        if (existingCartItem.getUser().getUserid() != user.getUserid()) {
            throw new ForbiddenException("Unauthorized cart access");
        }

        if(quantity <= 0){

            cartItemRepo.delete(existingCartItem);

            return "Item removed from cart";
        }

        if (quantity > existingCartItem.getProduct().getStockAmount()) {
            throw new ConflictException("Requested quantity exceeds available stock");
        }

        existingCartItem.setQuantity(quantity);

        cartItemRepo.save(existingCartItem);

        return "Quantity updated successfully";

    }
}
