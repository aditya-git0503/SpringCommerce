package com.aditya.ecommerce.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtService {

    @Value("${jwt.secret}")
    private String SECRET;

    @Value("${jwt.expiration}")
    private long EXPIRATION;

    // Cached signing key after validation
    private Key signingKey;

    @PostConstruct
    public void init() {
        if (SECRET == null || SECRET.trim().isEmpty()) {
            throw new IllegalStateException(
                    "Missing required environment variable JWT_SECRET: provide a base64-encoded signing key");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(SECRET);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("JWT_SECRET must be valid base64", ex);
        }

        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "Decoded JWT_SECRET is too short: require at least 32 bytes (256 bits) for HS256");
        }

        try {
            signingKey = Keys.hmacShaKeyFor(keyBytes);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("Failed to construct HMAC key from JWT_SECRET", ex);
        }
    }

    public String generateToken(String email){
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, email);
    }

    private String createToken(Map<String, Object> claims, String email) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key getSignKey() {
        return signingKey;
    }

    public String extractEmail(String token){
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token){
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver){
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token){
        return Jwts.parser()
            .setSigningKey(getSignKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    public boolean validateToken(String token, String email){
        final String extractedEmail = extractEmail(token);
        return (extractedEmail.equals(email) && !isTokenExpired(token));
    }

}