package com.example.app.service.interfaces;

import com.example.app.dto.LoginRequestDTO;
import com.example.app.dto.LoginResponseDTO;
import com.example.app.dto.RegisterRequestDTO;
import com.example.app.dto.VerifyOtpRequestDTO;

public interface IAuthService {
    LoginResponseDTO login(LoginRequestDTO loginRequest);
    LoginResponseDTO verifyOtp(VerifyOtpRequestDTO verifyRequest);
    String register(RegisterRequestDTO registerRequest);
}
