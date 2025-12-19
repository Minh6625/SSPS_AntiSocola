package com.example.app.config;

import com.example.app.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {}) // Enable CORS (sử dụng config từ WebConfig)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
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
                // Profile API - Student + SPSO
                .requestMatchers("/api/profile/**").hasAnyAuthority("Student", "SPSO")
                // Print Logs API - SPSO only
                .requestMatchers("/api/print-logs/**").hasAuthority("SPSO")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // Thêm JWT Filter vào chain (chạy trước UsernamePasswordAuthenticationFilter)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
