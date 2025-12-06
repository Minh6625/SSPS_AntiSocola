package com.example.app.exception;

/**
 * Custom Exception - Khi resource không tồn tại
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
