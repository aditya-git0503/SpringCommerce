package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.order.OrderItemResponseDTO;
import com.aditya.ecommerce.dto.order.OrderResponseDTO;
import com.aditya.ecommerce.dto.order.PlaceOrderRequestDTO;
import com.aditya.ecommerce.dto.order.UpdateOrderAddressRequestDTO;
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
import java.util.concurrent.ThreadLocalRandom;

@Service
public class OrderService {

    private static final String DISCOUNT_CODE = "WELCOME10";
    private static final float DISCOUNT_RATE = 0.10f;

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
        String fullAddress = order.getDeliveryFullAddress();
        String city = order.getDeliveryCity();
        String state = order.getDeliveryState();
        Integer pincode = order.getDeliveryPincode();
        String landmark = order.getDeliveryLandmark();
        Integer addressId = null;

        // Backward compatibility for old orders that were created before snapshot fields existed.
        if ((fullAddress == null || fullAddress.isBlank()) && order.getAddress() != null) {
            fullAddress = order.getAddress().getFullAddress();
            city = order.getAddress().getCity();
            state = order.getAddress().getState();
            pincode = order.getAddress().getPincode();
            landmark = order.getAddress().getLandmark();
            addressId = order.getAddress().getAddressId();
        }

        float finalAmount = order.getTotalAmountPaid();
        if (order.getOriginalAmount() != null && order.getDiscountAmount() != null
            && order.getDiscountAmount() > 0f) {
            finalAmount = Math.max(0f, order.getOriginalAmount() - order.getDiscountAmount());
        }

        return new OrderResponseDTO(
            order.getOrderId(),
            finalAmount,
            order.getOriginalAmount(),
            order.getDiscountAmount(),
            order.getOrderDate(),
            order.getStatus(),
            addressId,
            fullAddress,
            city,
            state,
            pincode,
            landmark,
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
        order.setStatus(pickRandomOrderStatus());
        order.setDeliveryFullAddress(confirmedAddress.getFullAddress());
        order.setDeliveryCity(confirmedAddress.getCity());
        order.setDeliveryState(confirmedAddress.getState());
        order.setDeliveryPincode(confirmedAddress.getPincode());
        order.setDeliveryLandmark(confirmedAddress.getLandmark());

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

        // record original amount before any discounts
        float originalAmount = amount;

        String discountCode = request.getDiscountCode();
        float appliedDiscount = 0f;
        if (discountCode != null && !discountCode.isBlank()) {
            String normalizedCode = discountCode.trim();
            if (!DISCOUNT_CODE.equalsIgnoreCase(normalizedCode)) {
                throw new BadRequestException("Invalid discount code");
            }
            appliedDiscount = amount * DISCOUNT_RATE;
            amount = Math.max(0f, amount - appliedDiscount);
            order.setDiscountCode(normalizedCode);
        }

        order.setOriginalAmount(originalAmount);
        order.setDiscountAmount(appliedDiscount);
        order.setTotalAmountPaid(amount);

        order.setOrderItems(orderItems);

        orderRepo.save(order);

        confirmedAddress.setLastUsedAt(LocalDateTime.now());
        addressRepo.save(confirmedAddress);

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

    public String updateOrderDeliveryAddress(String email, int orderId, UpdateOrderAddressRequestDTO request) {
        User confirmedUser = userRepo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Orders confirmedOrder = orderRepo.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (confirmedOrder.getUser().getUserid() != confirmedUser.getUserid()) {
            throw new ForbiddenException("You can edit only your own order");
        }

        if (!"PLACED".equalsIgnoreCase(confirmedOrder.getStatus())) {
            throw new ConflictException("Delivery address can be changed only when order is PLACED");
        }

        if (request.getFullAddress() == null || request.getFullAddress().isBlank() ||
                request.getCity() == null || request.getCity().isBlank() ||
                request.getState() == null || request.getState().isBlank() ||
                request.getPincode() == null) {
            throw new BadRequestException("Please provide full delivery address details");
        }

        confirmedOrder.setDeliveryFullAddress(request.getFullAddress().trim());
        confirmedOrder.setDeliveryCity(request.getCity().trim());
        confirmedOrder.setDeliveryState(request.getState().trim());
        confirmedOrder.setDeliveryPincode(request.getPincode());
        confirmedOrder.setDeliveryLandmark(
                request.getLandmark() == null || request.getLandmark().isBlank()
                        ? null
                        : request.getLandmark().trim()
        );

        orderRepo.save(confirmedOrder);
        return "Delivery address updated successfully";
    }

    private String pickRandomOrderStatus() {
        String[] statuses = {"PLACED", "IN_TRANSIT", "DELIVERED"};
        return statuses[ThreadLocalRandom.current().nextInt(statuses.length)];
    }
}
