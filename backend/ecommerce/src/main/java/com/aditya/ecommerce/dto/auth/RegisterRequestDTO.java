package com.aditya.ecommerce.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RegisterRequestDTO {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
}
