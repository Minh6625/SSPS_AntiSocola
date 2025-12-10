package com.example.app.security;

import com.example.app.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * JWT Authentication Filter
 * 
 * Chịu trách nhiệm:
 * 1. Extract JWT token từ request header (Authorization: Bearer <token>)
 * 2. Decode token và validate
 * 3. Lấy userId, email, role từ token
 * 4. Set Authentication vào SecurityContext
 * 
 * Được gọi trước các API endpoints, ngoại trừ những được permit (login, register, swagger)
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            // STEP 1: Lấy token từ header
            String authHeader = request.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                // Không có token, cho phép request tiếp tục (Spring Security sẽ check hasAuthority sau)
                filterChain.doFilter(request, response);
                return;
            }

            // STEP 2: Extract token (remove "Bearer " prefix)
            String token = authHeader.substring(7);

            // STEP 3: Decode token và validate
            Claims claims = jwtUtil.extractClaims(token);

            // STEP 4: Lấy thông tin từ token
            String userId = claims.get("userId", String.class);
            String email = claims.getSubject();
            String role = claims.get("role", String.class);

            log.debug("JWT validated for user: {}, role: {}", userId, role);

            // STEP 5: Tạo list authorities từ role
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            if (role != null && !role.isEmpty()) {
                // Thêm role như một authority (không thêm "ROLE_" prefix)
                authorities.add(new SimpleGrantedAuthority(role));
            }

            // STEP 6: Tạo Authentication object
            UsernamePasswordAuthenticationToken authentication = 
                new UsernamePasswordAuthenticationToken(
                    userId,                    // principal (sẽ được trả về bởi authentication.getName())
                    null,                      // credentials
                    authorities                // authorities (role)
                );

            // STEP 7: Set vào SecurityContext
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("Authentication set for user: {} with authorities: {}", userId, authorities);

        } catch (JwtException e) {
            log.warn("JWT token validation failed: {}", e.getMessage());
            // Token invalid, cho request tiếp tục (Spring Security sẽ reject)
            SecurityContextHolder.clearContext();
        } catch (Exception e) {
            log.error("Error processing JWT token: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        // Cho request tiếp tục
        filterChain.doFilter(request, response);
    }
}
