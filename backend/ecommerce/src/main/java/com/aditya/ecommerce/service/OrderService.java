package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.order.OrderItemResponseDTO;
import com.aditya.ecommerce.dto.order.OrderResponseDTO;
import com.aditya.ecommerce.dto.order.PlaceOrderRequestDTO;
import com.aditya.ecommerce.entity.*;
import com.aditya.ecommerce.repo.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final CartItemRepo cartItemRepo;
    private final UserRepo userRepo;
    private final AddressRepo addressRepo;
    private final ProductRepo productRepo;

    public OrderService(OrderRepo orderRepo,
                        OrderItemRepo orderItemRepo,
                        CartItemRepo cartItemRepo,
                        UserRepo userRepo,
                        AddressRepo addressRepo,
                        ProductRepo productRepo) {

        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartItemRepo = cartItemRepo;
        this.userRepo = userRepo;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
    }

    private OrderItemResponseDTO mapOrderItemToDTO(OrderItem orderItem){
        return new OrderItemResponseDTO(
                orderItem.getOrderItemId(),
                orderItem.getProduct().getProductId(),
                orderItem.getProductName(),
                orderItem.getQuantity(),
                orderItem.getPriceAtPurchase(),
                orderItem.getImageUrl(),
                orderItem.getDescription()
        );
    }

    private OrderResponseDTO mapOrderToDTO(Orders order){
        return new OrderResponseDTO(
                order.getOrderId(),
                order.getTotalAmountPaid(),
                order.getOrderDate(),
                order.getStatus(),
                order.getAddress().getAddressId(),
                order.getAddress().getFullAddress(),
                order.getOrderItems()
                        .stream()
                        .map(this::mapOrderItemToDTO)
                        .toList()
        );
    }

    public String placeOrder(PlaceOrderRequestDTO request) throws Exception {

        Optional<User> user = userRepo.findById(request.getUserId());

        if (!user.isPresent()) {
            throw new Exception("User not found");
        }

        User confirmedUser = user.get();

        Optional<Address> address =
                addressRepo.findById(request.getAddressId());

        if (!address.isPresent()) {
            throw new Exception("Address not found");
        }

        Address confirmedAddress = address.get();

        List<CartItem> cartItems =
                cartItemRepo.findAllById(request.getCartItemIds());

        if (cartItems.isEmpty()) {
            throw new Exception("No cart items selected");
        }

        Orders order = new Orders();

        order.setUser(confirmedUser);
        order.setAddress(confirmedAddress);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        float amount = 0;

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem c : cartItems) {

            Product product = c.getProduct();

            if (product.getStockAmount() < c.getQuantity()) {

                throw new Exception(
                        product.getProductName()
                                + " is out of stock. Only "
                                + product.getStockAmount()
                                + " items left"
                );
            }

            amount += product.getPrice() * c.getQuantity();

            product.setStockAmount(
                    product.getStockAmount() - c.getQuantity()
            );

            productRepo.save(product);

            OrderItem orderItem = new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);

            orderItem.setProductName(product.getProductName());

            orderItem.setQuantity(c.getQuantity());

            orderItem.setPriceAtPurchase(product.getPrice());

            orderItem.setImageUrl(product.getImageUrl());

            orderItem.setDescription(product.getDescription());

            orderItems.add(orderItem);
        }

        order.setTotalAmountPaid(amount);

        order.setOrderItems(orderItems);

        orderRepo.save(order);

        cartItemRepo.deleteAll(cartItems);

        return "Order placed successfully";
    }

    public List<OrderResponseDTO> getUserOrders(int userId) throws Exception{
        Optional<User> user = userRepo.findById(userId);
        if(!user.isPresent())
            throw new Exception("User not found");
        User confirmedUser = user.get();

        return orderRepo.findByUser(confirmedUser)
                .stream()
                .map(this :: mapOrderToDTO)
                .toList();
    }
}