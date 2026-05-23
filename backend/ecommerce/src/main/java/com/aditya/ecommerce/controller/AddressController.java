package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.address.AddressResponseDTO;
import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.service.AddressService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class AddressController {
    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @PostMapping("/address/add")
    public String addAddress(@RequestBody Address address) throws Exception{
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return addressService.addAddress(email, address);
    }

    @GetMapping("/address")
    public List<AddressResponseDTO> getUserAddress() throws Exception{
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return addressService.getUserAddress(email);
    }
}
