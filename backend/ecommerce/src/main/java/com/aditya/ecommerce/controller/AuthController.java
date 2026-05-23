package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.auth.LoginRequestDTO;
import com.aditya.ecommerce.dto.auth.LoginResponseDTO;
import com.aditya.ecommerce.dto.auth.RegisterRequestDTO;
import com.aditya.ecommerce.dto.auth.ResetPasswordDTO;
import com.aditya.ecommerce.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequestDTO request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }

    @PostMapping("/reset-password")
    public String resetPassword(@RequestBody ResetPasswordDTO request) {
        return authService.resetPassword(request);
    }
}
