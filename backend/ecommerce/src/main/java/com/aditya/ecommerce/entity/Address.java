package com.aditya.ecommerce.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "address")
public class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int addressId;

    @ManyToOne
    @JoinColumn(name = "userid")
    private User user;

    @NotNull
    private String fullAddress;
    @NotNull
    private String city;
    @NotNull
    private String state;

    @NotNull
    private int pincode;

    private String landmark;
}
