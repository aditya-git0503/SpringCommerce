package com.aditya.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponseDTO {
    private int addressId;
    private String fullAddress;
    private String city;
    private String state;
    private int pincode;
    private String landmark;
}
