package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.cart.AddToCartRequestDTO;
import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.security.AuthUtil;
import com.aditya.ecommerce.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/cart/add")
    public String addToCart(@RequestBody AddToCartRequestDTO request){
        String email = AuthUtil.getAuthenticatedEmail();
        return cartService.addToCart(
                email,
                request.getProductId(),
                request.getQuantity()
        );
    }

    @GetMapping("/cart")
    public List<CartResponseDTO> getCartItems(){
        String email = AuthUtil.getAuthenticatedEmail();
        return cartService.getCartItems(email);
    }

    @DeleteMapping("/cart/remove/{cartId}")
    public String removeFromCart(@PathVariable int cartId) {
        String email = AuthUtil.getAuthenticatedEmail();
        return cartService.removeFromCart(email, cartId);
    }

    @PutMapping("/cart/update")
    public String updateQuantity(
            @RequestParam int cartId,
            @RequestParam int quantity
    ) {
        String email = AuthUtil.getAuthenticatedEmail();
        return cartService.updateQuantity(email, cartId, quantity);
    }
}
