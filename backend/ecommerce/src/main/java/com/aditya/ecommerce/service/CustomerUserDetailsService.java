package com.aditya.ecommerce.service;

import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.repo.UserRepo;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class CustomerUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    public CustomerUserDetailsService(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<User> user = userRepo.findByUserEmail(username);
        if( !user.isPresent()){
            throw new UsernameNotFoundException("Username not found");
        }

        return new org.springframework.security.core.userdetails.User(
                user.get().getUserEmail(),
                user.get().getUserPassword(),
                new ArrayList<>()
        );
    }
}
