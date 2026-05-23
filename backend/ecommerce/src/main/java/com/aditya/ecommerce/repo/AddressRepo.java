package com.aditya.ecommerce.repo;

import com.aditya.ecommerce.entity.Address;
import com.aditya.ecommerce.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepo extends JpaRepository<Address, Integer> {
    List<Address> findByUserOrderByLastUsedAtDescAddressIdDesc(User user);
}
