package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.entity.CartItem;
import com.aditya.ecommerce.entity.Product;
import com.aditya.ecommerce.entity.User;
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
                .orElseThrow();

        Optional<CartItem> cartItem =
                cartItemRepo.findByUserAndProduct(user, confirmedProduct);

        if(cartItem.isPresent()){

            CartItem existingItem = cartItem.get();

            existingItem.setQuantity(
                    existingItem.getQuantity() + quantity
            );

            cartItemRepo.save(existingItem);
        }

        else{

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

    public String removeFromCart(int cartId) throws Exception {

        CartItem cartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new Exception("Cart item not found"));

        cartItemRepo.delete(cartItem);

        return "Item removed from cart";
    }

    public String updateQuantity(int cartId, int quantity) throws Exception {

        CartItem existingCartItem = cartItemRepo.findById(cartId)
                .orElseThrow(() -> new Exception("Cart Item not found"));

        if(quantity <= 0){

            cartItemRepo.delete(existingCartItem);

            return "Item removed from cart";
        }

        existingCartItem.setQuantity(quantity);

        cartItemRepo.save(existingCartItem);

        return "Quantity updated successfully";

    }
}
