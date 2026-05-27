package com.aditya.ecommerce.service;

import com.aditya.ecommerce.dto.auth.LoginRequestDTO;
import com.aditya.ecommerce.dto.auth.LoginResponseDTO;
import com.aditya.ecommerce.dto.auth.RegisterRequestDTO;
import com.aditya.ecommerce.dto.auth.ResetPasswordDTO;
import com.aditya.ecommerce.entity.User;
import com.aditya.ecommerce.exception.BadRequestException;
import com.aditya.ecommerce.exception.ConflictException;
import com.aditya.ecommerce.exception.ResourceNotFoundException;
import com.aditya.ecommerce.exception.UnauthorizedException;
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

    public String register(RegisterRequestDTO request){
        String normalizedEmail = normalizeEmail(request.getEmail());

        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new BadRequestException("Passwords do not match");
        }

        if(userRepo.findByUserEmail(normalizedEmail).isPresent()){
            throw new ConflictException("User is already registered, sign in instead");
        }
        else{
            User user = new User();
            user.setUserName(request.getName());
            user.setUserEmail(normalizedEmail);
            user.setUserPassword(encoder.encode(request.getPassword()));
            user.setCreatedAtDate(new Date(System.currentTimeMillis()));
            userRepo.save(user);
            return "User Registration Successful";
        }
    }

    public LoginResponseDTO login(LoginRequestDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        Optional<User> user = userRepo.findByUserEmail(normalizedEmail);
        if(!user.isPresent())
            throw new ResourceNotFoundException("Email not found. Register instead");
        User confirmedUser = user.get();

        if(!encoder.matches(request.getPassword(), confirmedUser.getUserPassword()))
            throw new UnauthorizedException("Invalid password. Try again!");

        return new LoginResponseDTO(
                jwtService.generateToken(confirmedUser.getUserEmail()),
                "Login Successful",
                confirmedUser.getUserid(),
                confirmedUser.getUserName(),
                confirmedUser.getUserEmail()
        );
    }

    public String resetPassword(ResetPasswordDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        Optional<User> user = userRepo.findByUserEmail(normalizedEmail);
        if(!user.isPresent())
            throw new ResourceNotFoundException("User not found");
        User confirmedUser = user.get();
        if(request.getNewPassword() == null || request.getNewPassword().isBlank())
            throw new BadRequestException("New password cannot be empty");
        if(request.getNewPassword().length() < 6)
            throw new BadRequestException("Password must be at least 6 characters");
        if(!(request.getNewPassword().equals(request.getConfirmPassword())))
            throw new BadRequestException("Passwords do not match. Try again");

        confirmedUser.setUserPassword(encoder.encode(request.getNewPassword()));
        userRepo.save(confirmedUser);
        return "Password reset successful";
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase();
    }
}
