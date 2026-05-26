package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.address.AddressResponseDTO;
import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.security.AuthUtil;
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
    public String addAddress(@RequestBody Address address) {
        String email = AuthUtil.getAuthenticatedEmail();
        return addressService.addAddress(email, address);
    }

    @GetMapping("/address")
    public List<AddressResponseDTO> getUserAddress() {
        String email = AuthUtil.getAuthenticatedEmail();
        return addressService.getUserAddress(email);
    }

    @PutMapping("/address/{addressId}")
    public String updateAddress(@PathVariable int addressId, @RequestBody Address address) {
        String email = AuthUtil.getAuthenticatedEmail();
        return addressService.updateAddress(email, addressId, address);
    }

    @DeleteMapping("/address/{addressId}")
    public String deleteAddress(@PathVariable int addressId) {
        String email = AuthUtil.getAuthenticatedEmail();
        return addressService.deleteAddress(email, addressId);
    }
}
