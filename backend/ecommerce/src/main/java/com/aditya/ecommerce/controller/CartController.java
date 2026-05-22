package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.cart.AddToCartRequestDTO;
import com.aditya.ecommerce.dto.cart.CartResponseDTO;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.repo.UserRepo;
import com.aditya.ecommerce.service.CartService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
public class CartController {

    private final UserRepo userRepo;
    private final CartService cartService;

    public CartController(UserRepo userRepo, CartService cartService) {
        this.userRepo = userRepo;
        this.cartService = cartService;
    }

    @PostMapping("/cart/add")
    public String addToCart(@RequestBody AddToCartRequestDTO request){

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepo.findByUserEmail(email)
                .orElseThrow();

        return cartService.addToCart(
                user,
                request.getProductId(),
                request.getQuantity()
        );
    }

    @GetMapping("/cart")
    public List<CartResponseDTO> getCartItems(){

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepo.findByUserEmail(email)
                .orElseThrow();

        return cartService.getCartItems(user);
    }

    @DeleteMapping("/cart/remove/{cartId}")
    public String removeFromCart(@PathVariable int cartId) throws Exception {

        return cartService.removeFromCart(cartId);
    }

    @PutMapping("/cart/update")
    public String updateQuantity(
            @RequestParam int cartId,
            @RequestParam int quantity
    ) throws Exception {

        return cartService.updateQuantity(cartId, quantity);
    }
}