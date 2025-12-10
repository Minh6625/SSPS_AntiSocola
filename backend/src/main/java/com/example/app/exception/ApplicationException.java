package com.example.app.exception;

/**
 * EXCEPTION: ApplicationException
 * Exception tùy chỉnh cho toàn bộ ứng dụng
 * Được dùng để wrap lỗi business logic với HTTP status code
 */
public class ApplicationException extends RuntimeException {
    
    private int statusCode;
    private String message;
    
    /**
     * Constructor với statusCode
     * @param message Thông báo lỗi
     * @param statusCode HTTP status code (400, 404, 500, ...)
     */
    public ApplicationException(String message, int statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
    }
    
    /**
     * Constructor mặc định (500 Internal Server Error)
     * @param message Thông báo lỗi
     */
    public ApplicationException(String message) {
        super(message);
        this.message = message;
        this.statusCode = 500;
    }
    
    /**
     * Constructor với cause
     * @param message Thông báo lỗi
     * @param statusCode HTTP status code
     * @param cause Nguyên nhân (nested exception)
     */
    public ApplicationException(String message, int statusCode, Throwable cause) {
        super(message, cause);
        this.message = message;
        this.statusCode = statusCode;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
    
    @Override
    public String getMessage() {
        return message;
    }
}
