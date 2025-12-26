package com.example.app.config;

import com.example.app.interceptor.MaintenanceInterceptor;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web Configuration - CORS Setup + Bean Management + Interceptors
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {
    
    private final MaintenanceInterceptor maintenanceInterceptor;
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // Cho phép mọi origin (development only)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(maintenanceInterceptor)
                .addPathPatterns("/api/**") // Áp dụng cho tất cả API
                .excludePathPatterns(
                    "/api/auth/**",           // Cho phép login/logout
                    "/api/spso/**",           // SPSO vẫn truy cập được
                    "/api/admin/**"           // Admin vẫn truy cập được
                );
    }
    
    /**
     * Bean: ModelMapper
     * Dùng để map giữa Entity và DTO
     */
    @Bean
    public ModelMapper modelMapper() {
        return new ModelMapper();
    }
}
