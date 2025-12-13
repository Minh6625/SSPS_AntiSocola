package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main Application Entry Point
 */
@SpringBootApplication
@EnableScheduling  // Enable scheduled tasks for print queue processing
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
