package com.example.app.service.interfaces;

import com.example.app.dto.LoginRequestDTO;
import com.example.app.dto.LoginResponseDTO;
import com.example.app.dto.RegisterRequestDTO;
import com.example.app.dto.VerifyOtpRequestDTO;
import com.example.app.entity.User;

/**
 * Service Interface: Authentication
 * Tuân thủ Layered Architecture - Service trả về Entity, không phải DTO
 */
public interface IAuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    LoginResponseDTO verifyOtp(VerifyOtpRequestDTO verifyRequest);
}
