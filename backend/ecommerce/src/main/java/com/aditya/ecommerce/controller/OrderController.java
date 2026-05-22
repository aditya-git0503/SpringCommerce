package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.order.OrderResponseDTO;
import com.aditya.ecommerce.dto.order.PlaceOrderRequestDTO;
import com.aditya.ecommerce.service.OrderService;
import org.springframework.aop.target.LazyInitTargetSource;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/order/place")
    public String placeOrder(@RequestBody PlaceOrderRequestDTO request) throws Exception{
        return orderService.placeOrder(request);
    }

    @GetMapping("/orders")
    public List<OrderResponseDTO> getOrders(@RequestParam int userId) throws Exception {
        return orderService.getUserOrders(userId);
    }
}
