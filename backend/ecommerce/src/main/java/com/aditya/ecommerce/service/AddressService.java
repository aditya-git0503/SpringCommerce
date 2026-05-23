package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.address.AddressResponseDTO;
import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.entity.Orders;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.exception.ForbiddenException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.repo.AddressRepo;
import com.aditya.ecommerce.repo.OrderRepo;
import com.aditya.ecommerce.repo.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    private final AddressRepo addressRepo;
    private final UserRepo userRepo;
    private final OrderRepo orderRepo;

    public AddressService(AddressRepo addressRepo, UserRepo userRepo, OrderRepo orderRepo) {
        this.addressRepo = addressRepo;
        this.userRepo = userRepo;
        this.orderRepo = orderRepo;
    }

    private AddressResponseDTO mapToDTO(Address address){
        return new AddressResponseDTO(address.getAddressId(),
                address.getFullAddress(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                address.getLandmark()
                );
    }

    public String addAddress(String email, Address address) {
        Optional<User> user = userRepo.findByUserEmail(email);
        if(!user.isPresent())
            throw new ResourceNotFoundException("User not present");
        User confirmedUser = user.get();
        address.setUser(confirmedUser);
        addressRepo.save(address);
        return "Address Saved Successfully";
    }

    public List<AddressResponseDTO> getUserAddress(String email) {
        Optional<User> user = userRepo.findByUserEmail(email);
        if(!user.isPresent())
            throw new ResourceNotFoundException("No such user");
        User confirmedUser = user.get();
        return addressRepo.findByUserOrderByLastUsedAtDescAddressIdDesc(confirmedUser)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    public String updateAddress(String email, int addressId, Address address) {
        User confirmedUser = userRepo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No such user"));

        Address confirmedAddress = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (confirmedAddress.getUser().getUserid() != confirmedUser.getUserid()) {
            throw new ForbiddenException("You can update only your own address");
        }

        confirmedAddress.setFullAddress(address.getFullAddress());
        confirmedAddress.setCity(address.getCity());
        confirmedAddress.setState(address.getState());
        confirmedAddress.setPincode(address.getPincode());
        confirmedAddress.setLandmark(address.getLandmark());

        addressRepo.save(confirmedAddress);
        return "Address updated successfully";
    }

    public String deleteAddress(String email, int addressId) {
        User confirmedUser = userRepo.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No such user"));

        Address confirmedAddress = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));

        if (confirmedAddress.getUser().getUserid() != confirmedUser.getUserid()) {
            throw new ForbiddenException("You can delete only your own address");
        }

        List<Orders> linkedOrders = orderRepo.findByAddress(confirmedAddress);
        if (!linkedOrders.isEmpty()) {
            for (Orders order : linkedOrders) {
                if (order.getDeliveryFullAddress() == null || order.getDeliveryFullAddress().isBlank()) {
                    order.setDeliveryFullAddress(confirmedAddress.getFullAddress());
                }
                if (order.getDeliveryCity() == null || order.getDeliveryCity().isBlank()) {
                    order.setDeliveryCity(confirmedAddress.getCity());
                }
                if (order.getDeliveryState() == null || order.getDeliveryState().isBlank()) {
                    order.setDeliveryState(confirmedAddress.getState());
                }
                if (order.getDeliveryPincode() == null) {
                    order.setDeliveryPincode(confirmedAddress.getPincode());
                }
                if (order.getDeliveryLandmark() == null || order.getDeliveryLandmark().isBlank()) {
                    order.setDeliveryLandmark(confirmedAddress.getLandmark());
                }
                order.setAddress(null);
            }
            orderRepo.saveAll(linkedOrders);
        }

        addressRepo.delete(confirmedAddress);
        return "Address deleted successfully";
    }
}
