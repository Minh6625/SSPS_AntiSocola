package com.example.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * In ra các URLs có sẵn khi backend khởi động
 * Giúp user click trực tiếp vào console
 */
@Component
public class StartupUrlPrinter implements ApplicationRunner {

    @Value("${server.port:8080}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String contextPath;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        String baseUrl = "http://localhost:" + serverPort + contextPath;
        String swaggerUrl = baseUrl + "/swagger-ui.html";

        System.out.println("\n");
        System.out.println("🚀 SSPS Backend started!");
        System.out.println("🔐 Swagger: " + swaggerUrl);
        System.out.println("");
    }
}
