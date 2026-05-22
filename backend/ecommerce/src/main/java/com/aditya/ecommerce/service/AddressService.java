package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.AddressResponseDTO;
import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.repo.AddressRepo;
import com.aditya.ecommerce.repo.UserRepo;
import jdk.dynalink.linker.LinkerServices;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Service
public class AddressService {
    private final AddressRepo addressRepo;
    private final UserRepo userRepo;

    public AddressService(AddressRepo addressRepo, UserRepo userRepo) {
        this.addressRepo = addressRepo;
        this.userRepo = userRepo;
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

    public String addAddress(int userId, Address address) throws Exception {
        Optional<User> user = userRepo.findById(userId);
        if(!user.isPresent())
            throw new Exception("User not present");
        User confirmedUser = user.get();
        address.setUser(confirmedUser);
        addressRepo.save(address);
        return "Address Saved Successfully";
    }

    public List<AddressResponseDTO> getUserAddress(int userId) throws Exception {
        Optional<User> user = userRepo.findById(userId);
        if(!user.isPresent())
            throw new Exception("No such user");
        User confirmedUser = user.get();
        return addressRepo.findByUser(confirmedUser)
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
}
