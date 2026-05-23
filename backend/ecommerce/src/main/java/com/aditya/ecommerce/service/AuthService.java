package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.auth.LoginRequestDTO;
import com.aditya.ecommerce.dto.auth.LoginResponseDTO;
import com.aditya.ecommerce.dto.auth.RegisterRequestDTO;
import com.aditya.ecommerce.dto.auth.ResetPasswordDTO;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.repo.UserRepo;
import com.aditya.ecommerce.security.JwtService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder encoder;

    public AuthService(UserRepo userRepo, JwtService jwtService, BCryptPasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.encoder = encoder;
    }

    public String register(RegisterRequestDTO request) throws Exception{
        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new Exception("Passwords do not match! Try again");
        }

        if(userRepo.findByUserEmail(request.getEmail()).isPresent()){
            throw new Exception("User is already registered, sign in instead");
        }
        else{
            User user = new User();
            user.setUserName(request.getName());
            user.setUserEmail(request.getEmail());
            user.setUserPassword(encoder.encode(request.getPassword()));
            user.setCreatedAtDate(new Date(System.currentTimeMillis()));
            userRepo.save(user);
            return "User Registration Successful";
        }
    }

    public LoginResponseDTO login(LoginRequestDTO request) throws Exception{
        Optional<User> user = userRepo.findByUserEmail(request.getEmail());
        if(!user.isPresent())
            throw new Exception("Email not found. Register instead");
        User confirmedUser = user.get();

        if(!encoder.matches(request.getPassword(), confirmedUser.getUserPassword()))
            throw new Exception("Invalid password. Try again!");

        return new LoginResponseDTO(
                jwtService.generateToken(confirmedUser.getUserEmail()),
                "Login Successful",
                confirmedUser.getUserid(),
                confirmedUser.getUserName(),
                confirmedUser.getUserEmail()
        );
    }

    public String resetPassword(ResetPasswordDTO request) throws Exception {
        Optional<User> user = userRepo.findByUserEmail(request.getEmail());
        if(!user.isPresent())
            throw new Exception("User not found");
        User confirmedUser = user.get();
        if(!(request.getNewPassword().equals(request.getConfirmPassword())))
            throw new Exception("Passwords do not match. Try again");

        confirmedUser.setUserPassword(encoder.encode(request.getNewPassword()));
        userRepo.save(confirmedUser);
        return "Password reset successful";
    }
}
