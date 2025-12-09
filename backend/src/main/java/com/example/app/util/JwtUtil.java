package com.example.app.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret:hcmiu-ssps-secret-key-for-jwt-token-generation-2024-minimum-256-bits}")
    private String secret;

    @Value("${jwt.access.expiration:900000}") // 15 minutes
    private Long accessTokenExpiration;
    
    @Value("${jwt.refresh.expiration:604800000}") // 7 days
    private Long refreshTokenExpiration;
    
    @Value("${jwt.registration.expiration:900000}") // 15 minutes
    private Long registrationTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Generate Access Token (15 minutes)
     */
    public String generateAccessToken(String userId, String email, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Generate Refresh Token (7 days) - Fixed, không rotate
     */
    public String generateRefreshToken(String userId, String email) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("email", email);

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return extractClaims(token).getSubject();
    }

    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token, String email) {
        return (extractEmail(token).equals(email) && !isTokenExpired(token));
    }
    
    /**
     * Generate Registration Token (15 minutes)
     * Chứa thông tin đăng ký tạm thời để verify OTP
     */
    public String generateRegistrationToken(String email, String studentId, String fullName, String password) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("studentId", studentId);
        claims.put("fullName", fullName);
        claims.put("password", password);
        claims.put("tokenType", "REGISTRATION");

        return Jwts.builder()
                .claims(claims)
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + registrationTokenExpiration))
                .signWith(getSigningKey())
                .compact();
    }
    
    /**
     * Extract StudentId từ token
     */
    public String extractStudentId(String token) {
        return extractClaims(token).get("studentId", String.class);
    }
    
    /**
     * Extract FullName từ token
     */
    public String extractFullName(String token) {
        return extractClaims(token).get("fullName", String.class);
    }
    
    /**
     * Extract Password từ token
     */
    public String extractPassword(String token) {
        return extractClaims(token).get("password", String.class);
    }
    
    /**
     * Check token is valid (not expired)
     */
    public boolean isTokenValid(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }
}
