package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static java.util.stream.Collectors.toList;

@RestController
public class CartController {
    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/cart/add")
    public String addToCart(@RequestParam int userId, @RequestParam int productId, @RequestParam int quantity){
        return cartService.addToCart(userId, productId, quantity);
    }

    @GetMapping("/cart")
    public List<CartResponseDTO> getCartItems(@RequestParam int userId){
        return cartService.getCartItems(userId);
    }

    @DeleteMapping("/cart/remove/{cartId}")
    public String removeFromCart(@PathVariable int cartId) throws Exception {
        return cartService.removeFromCart(cartId);
    }

    @PutMapping("/cart/update")
    public String updateQuantity(
            @RequestParam int cartId,
            @RequestParam int quantity
    ) throws Exception{
        return cartService.updateQuantity(cartId, quantity);
    }
}
