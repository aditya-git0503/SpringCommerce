package com.aditya.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "orders")
public class Orders {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "address_id")
    private Address address;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;

    @PositiveOrZero(message = "Amount cannot be negative")
    private float totalAmountPaid;

    @PositiveOrZero(message = "Amount cannot be negative")
    private Float originalAmount;

    @PositiveOrZero(message = "Amount cannot be negative")
    private Float discountAmount;

    private String discountCode;

    private LocalDateTime orderDate;

    private String status;

    @Column(name = "delivery_full_address")
    private String deliveryFullAddress;

    @Column(name = "delivery_city")
    private String deliveryCity;

    @Column(name = "delivery_state")
    private String deliveryState;

    @Column(name = "delivery_pincode")
    private Integer deliveryPincode;

    @Column(name = "delivery_landmark")
    private String deliveryLandmark;
}
