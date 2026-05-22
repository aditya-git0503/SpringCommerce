package com.aditya.ecommerce.dto.order;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PlaceOrderRequestDTO {
    private int userId;
    private int addressId;
    private List<Integer> cartItemIds;
}
