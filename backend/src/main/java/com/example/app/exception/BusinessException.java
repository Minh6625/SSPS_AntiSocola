package com.example.app.exception;

/**
 * Custom Exception: Business Logic Error
 * Dùng khi vi phạm quy tắc nghiệp vụ
 */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
