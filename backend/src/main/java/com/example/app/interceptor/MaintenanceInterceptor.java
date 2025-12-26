package com.example.app.interceptor;

import com.example.app.repository.SystemConfigRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * INTERCEPTOR: Maintenance Mode
 * Chặn tất cả request từ Student khi hệ thống đang bảo trì
 * SPSO vẫn có thể truy cập để quản lý
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceInterceptor implements HandlerInterceptor {
    
    private final SystemConfigRepository systemConfigRepository;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        log.debug("MaintenanceInterceptor.preHandle() called for: {} {}", 
            request.getMethod(), request.getRequestURI());
        
        // Bỏ qua OPTIONS request (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        
        // Lấy authentication
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Nếu chưa authenticate hoặc là anonymous → cho qua (sẽ bị chặn bởi Security)
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            return true;
        }
        
        // Kiểm tra role
        boolean isStudent = authentication.getAuthorities().stream()
            .anyMatch(auth -> {
                String authority = auth.getAuthority();
                // Check both "Student" and "ROLE_Student"
                return "Student".equals(authority) || "ROLE_Student".equals(authority);
            });
        
        log.debug("User: {}, isStudent: {}, authorities: {}", 
            authentication.getName(), isStudent, authentication.getAuthorities());
        
        // Nếu không phải Student → cho qua (SPSO, Admin có thể truy cập khi bảo trì)
        if (!isStudent) {
            log.debug("Not a student, allowing request");
            return true;
        }
        
        // Kiểm tra maintenance mode từ SystemConfig
        boolean isMaintenanceMode = systemConfigRepository.findByConfigKey("system_maintenance_mode")
            .map(config -> {
                log.debug("Found maintenance config: key={}, value={}", 
                    config.getConfigKey(), config.getConfigValue());
                return "true".equalsIgnoreCase(config.getConfigValue());
            })
            .orElse(false);
        
        log.info("Maintenance mode check: isMaintenanceMode={}, user={}, isStudent={}", 
            isMaintenanceMode, authentication.getName(), isStudent);
        
        if (isMaintenanceMode) {
            log.warn("Maintenance mode is ON. Blocking student request: {} {}", 
                request.getMethod(), request.getRequestURI());
            
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // 503
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Hệ thống đang bảo trì. Vui lòng quay lại sau.\"}"
            );
            return false; // Chặn request
        }
        
        return true; // Cho qua
    }
}
