package com.aditya.ecommerce.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderAddressRequestDTO {
    private String fullAddress;
    private String city;
    private String state;
    private Integer pincode;
    private String landmark;
}
