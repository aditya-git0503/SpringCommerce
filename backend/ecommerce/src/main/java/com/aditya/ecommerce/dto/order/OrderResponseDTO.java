package com.aditya.ecommerce.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponseDTO {
    private int orderId;
    private float totalAmountPaid;
    private Float originalAmount;
    private Float discountAmount;
    private LocalDateTime orderDate;
    private String status;
    private Integer addressId;
    private String fullAddress;
    private String city;
    private String state;
    private Integer pincode;
    private String landmark;
    private List<OrderItemResponseDTO> orderItems;
}
