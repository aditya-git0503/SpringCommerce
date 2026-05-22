package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.AddressResponseDTO;
import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.service.AddressService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("/address/add")
    public String addAddress(@RequestParam int userId, @RequestBody Address address) throws Exception{
        return addressService.addAddress(userId, address);
    }

    @GetMapping("/address")
    public List<AddressResponseDTO> getUserAddress(@RequestParam int userId) throws Exception{
        return addressService.getUserAddress(userId);
    }
}
