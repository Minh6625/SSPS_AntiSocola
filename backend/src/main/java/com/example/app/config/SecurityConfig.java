package com.example.app.config;

import com.example.app.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Security Configuration
 * - Cấu hình JWT authentication
 * - Exclude public endpoints (login, register, webhook, swagger)
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                // Public endpoints - không cần JWT
                .requestMatchers("/api/auth/**").permitAll()
                
                // Webhook endpoints - không cần JWT
                .requestMatchers("/hooks/**").permitAll()
                
                // Swagger/OpenAPI - không cần JWT
                .requestMatchers("/swagger-ui.html").permitAll()
                .requestMatchers("/swagger-ui/**").permitAll()
                .requestMatchers("/swagger-resources/**").permitAll()
                .requestMatchers("/v3/api-docs/**").permitAll()
                .requestMatchers("/api-docs/**").permitAll()
                .requestMatchers("/webjars/**").permitAll()
                
                // WebSocket - không cần JWT
                .requestMatchers("/ws/**").permitAll()
                
                // Health check
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // Tất cả endpoint khác cần JWT
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/error", "/actuator/**", "/actuator/health", "/health").permitAll()
                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/api-docs/**").permitAll()
                // Reference Data API - Temporary: permitAll for debugging
                .requestMatchers("/api/reference/**").permitAll()
                // Document API (Print Flow) - chỉ cho Student
                .requestMatchers("/api/documents/**").hasAuthority("Student")
                   // User API (current user info & balance) - Student + SPSO
                   .requestMatchers("/api/users/me/**").hasAnyAuthority("Student", "SPSO")
                // Printer API - cho SPSO và Student (chọn máy in)
                .requestMatchers("/api/printers/**").hasAnyAuthority("SPSO", "Student")
                // PrintJob API - Student + SPSO
                .requestMatchers("/api/print-jobs/**").hasAnyAuthority("Student", "SPSO")
                // PageBalance API - Student + SPSO
                .requestMatchers("/api/page-balance/**").hasAnyAuthority("Student", "SPSO")
                // Payment API - Student + SPSO
                .requestMatchers("/api/payment/**").hasAnyAuthority("Student", "SPSO")
                // Profile API - Student + SPSO
                .requestMatchers("/api/profile/**").hasAnyAuthority("Student", "SPSO")
                // Print Logs API - SPSO only
                .requestMatchers("/api/print-logs/**").hasAuthority("SPSO")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
