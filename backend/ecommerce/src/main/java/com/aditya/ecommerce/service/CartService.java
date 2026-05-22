package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.dto.product.ProductResponseDTO;
import com.aditya.ecommerce.entity.CartItem;
import com.aditya.ecommerce.entity.Product;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.repo.CartItemRepo;
import com.aditya.ecommerce.repo.ProductRepo;
import com.aditya.ecommerce.repo.UserRepo;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {
    private final CartItemRepo cartItemRepo;
    private final ProductRepo productRepo;
    private final UserRepo userRepo;

    public CartService(CartItemRepo cartItemRepo, ProductRepo productRepo, UserRepo userRepo) {
        this.cartItemRepo = cartItemRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
    }

    private CartResponseDTO mapToDTO(CartItem item){
        return new CartResponseDTO(
                item.getQuantity(),
                item.getProduct().getProductId(),
                item.getProduct().getProductName(),
                item.getProduct().getPrice(),
                item.getProduct().getImageUrl()
        );
    }

    public String addToCart(int userId, int productId, int quantity){
        Optional<User> user = userRepo.findById(userId);
        Optional<Product> product = productRepo.findById(productId);
        User confirmedUser = user.orElseThrow();
        Product confirmedProduct = product.orElseThrow();

        Optional<CartItem> cartItem = cartItemRepo.findByUserAndProduct(confirmedUser, confirmedProduct);
        if(cartItem.isPresent()){
            CartItem existingItem = cartItem.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            cartItemRepo.save(existingItem);
        }
        else{
            CartItem cartItem1 = new CartItem();
            cartItem1.setUser(confirmedUser);
            cartItem1.setProduct(confirmedProduct);
            cartItem1.setQuantity(quantity);

            cartItemRepo.save(cartItem1);
        }
        return "Product Added to Cart!";
    }

    public List<CartResponseDTO> getCartItems(int userId){
        Optional<User> user = userRepo.findById(userId);
        return cartItemRepo.findByUser(user.get())
                .stream()
                .map(this :: mapToDTO)
                .toList();
    }

    public String removeFromCart(int cartId) throws Exception {
        Optional<CartItem> cartItem = cartItemRepo.findById(cartId);
        if(!cartItem.isPresent())
            throw new Exception("Cart item not found");
        cartItemRepo.deleteById(cartId);
        return "Item removed from cart";
    }

    public String updateQuantity(int cartId, int quantity) throws Exception{
        Optional<CartItem> cartItem = cartItemRepo.findById(cartId);
        if(!cartItem.isPresent())
            throw new Exception("Cart Item not found");
        CartItem existsCartItem = cartItem.get();
        existsCartItem.setQuantity(quantity);
        cartItemRepo.save(existsCartItem);
        return "Quantity updated succesfully";
    }
}
