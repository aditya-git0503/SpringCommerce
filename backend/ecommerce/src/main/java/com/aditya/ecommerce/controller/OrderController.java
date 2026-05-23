package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.order.OrderResponseDTO;
import com.aditya.ecommerce.dto.order.PlaceOrderRequestDTO;
import com.aditya.ecommerce.service.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/order/place")
    public String placeOrder(@RequestBody PlaceOrderRequestDTO request) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return orderService.placeOrder(email, request);
    }

    @GetMapping("/orders")
    public List<OrderResponseDTO> getOrders()  {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return orderService.getUserOrders(email);
    }
}
