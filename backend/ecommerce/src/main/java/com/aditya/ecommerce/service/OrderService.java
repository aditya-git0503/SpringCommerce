package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.order.OrderItemResponseDTO;
import com.aditya.ecommerce.dto.order.OrderResponseDTO;
import com.aditya.ecommerce.dto.order.PlaceOrderRequestDTO;
import com.aditya.ecommerce.entity.*;
import com.aditya.ecommerce.exception.BadRequestException;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class OrderService {

    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final CartItemRepo cartItemRepo;
    private final UserRepo userRepo;
    private final AddressRepo addressRepo;
    private final ProductRepo productRepo;
    private final ProductRatingRepo productRatingRepo;

    public OrderService(OrderRepo orderRepo,
                        OrderItemRepo orderItemRepo,
                        CartItemRepo cartItemRepo,
                        UserRepo userRepo,
                        AddressRepo addressRepo,
                        ProductRepo productRepo,
                        ProductRatingRepo productRatingRepo) {

        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartItemRepo = cartItemRepo;
        this.userRepo = userRepo;
        this.addressRepo = addressRepo;
        this.productRepo = productRepo;
        this.productRatingRepo = productRatingRepo;
    }

    private OrderItemResponseDTO mapOrderItemToDTO(OrderItem orderItem, User user){
        Integer userRating = productRatingRepo.findByOrderItem(orderItem)
                .map(ProductRating::getRating)
                .orElse(null);
        return new OrderItemResponseDTO(
                orderItem.getOrderItemId(),
                orderItem.getProduct().getProductId(),
                orderItem.getProductName(),
                orderItem.getQuantity(),
                orderItem.getPriceAtPurchase(),
                orderItem.getImageUrl(),
                orderItem.getDescription(),
                userRating
        );
    }

    private OrderResponseDTO mapOrderToDTO(Orders order, User user){
        return new OrderResponseDTO(
                order.getOrderId(),
                order.getTotalAmountPaid(),
                order.getOrderDate(),
                order.getStatus(),
                order.getAddress().getAddressId(),
                order.getAddress().getFullAddress(),
                order.getOrderItems()
                        .stream()
                        .map(item -> mapOrderItemToDTO(item, user))
                        .toList()
        );
    }

    public String placeOrder(String email, PlaceOrderRequestDTO request) {

        Optional<User> user = userRepo.findByUserEmail(email);

        if (!user.isPresent()) {
            throw new ResourceNotFoundException("User not found");
        }

        User confirmedUser = user.get();

        Optional<Address> address =
                addressRepo.findById(request.getAddressId());

        if (!address.isPresent()) {
            throw new ResourceNotFoundException("Address not found");
        }

        Address confirmedAddress = address.get();
        if (confirmedAddress.getUser().getUserid() != confirmedUser.getUserid()) {
            throw new ForbiddenException("Address does not belong to logged-in user");
        }

        List<CartItem> cartItems =
                cartItemRepo.findAllById(request.getCartItemIds());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("No cart items selected");
        }
        boolean invalidCartOwnership = cartItems.stream()
                .anyMatch(item -> item.getUser().getUserid() != confirmedUser.getUserid());
        if (invalidCartOwnership) {
            throw new ForbiddenException("One or more cart items do not belong to logged-in user");
        }

        Orders order = new Orders();

        order.setUser(confirmedUser);
        order.setAddress(confirmedAddress);
        order.setOrderDate(LocalDateTime.now());
        order.setStatus("PLACED");

        float amount = 0;

        List<OrderItem> orderItems = new ArrayList<>();
        Set<Product> updatedProducts = new HashSet<>();

        for (CartItem c : cartItems) {

            Product product = c.getProduct();

            if (product.getStockAmount() < c.getQuantity()) {

                throw new ConflictException(
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
            updatedProducts.add(product);

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

        for (Product product : updatedProducts) {
            product.setTotalBuyers(product.getTotalBuyers() + 1);
            productRepo.save(product);
        }

        cartItemRepo.deleteAll(cartItems);

        return "Order placed successfully";
    }

    public List<OrderResponseDTO> getUserOrders(String email){
        Optional<User> user = userRepo.findByUserEmail(email);
        if(!user.isPresent())
            throw new ResourceNotFoundException("User not found");
        User confirmedUser = user.get();

        return orderRepo.findOrdersWithItemsByUser(confirmedUser)
                .stream()
                .map(order -> mapOrderToDTO(order, confirmedUser))
                .toList();
    }
}
