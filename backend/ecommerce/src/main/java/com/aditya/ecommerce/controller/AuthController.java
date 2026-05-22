package com.aditya.ecommerce.controller;

import com.aditya.ecommerce.dto.auth.LoginRequestDTO;
import com.aditya.ecommerce.dto.auth.LoginResponseDTO;
import com.aditya.ecommerce.dto.auth.RegisterRequestDTO;
import com.aditya.ecommerce.dto.auth.ResetPasswordDTO;
import com.aditya.ecommerce.service.AuthService;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequestDTO request) throws Exception{
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginRequestDTO request) throws Exception{
        return authService.login(request);
    }

    @PostMapping("/auth/reset-password")
    public String resetPassword(@RequestBody ResetPasswordDTO request) throws Exception{
        return authService.resetPassword(request);
    }
}
