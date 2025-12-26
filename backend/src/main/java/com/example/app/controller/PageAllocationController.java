package com.example.app.controller;

import com.example.app.scheduler.PageAllocationScheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST CONTROLLER: Page Allocation
 * API để SPSO trigger cấp phát trang thủ công
 */
@RestController
@RequestMapping("/api/spso/page-allocation")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Page Allocation", description = "API cấp phát trang cho sinh viên")
public class PageAllocationController {
    
    private final PageAllocationScheduler pageAllocationScheduler;
    
    /**
     * POST /api/spso/page-allocation/allocate-current-semester
     * Cấp phát trang cho học kỳ hiện tại (manual trigger)
     */
    @PostMapping("/allocate-current-semester")
    @Operation(summary = "Cấp phát trang cho học kỳ hiện tại", 
               description = "SPSO trigger thủ công để cấp phát trang cho tất cả sinh viên trong học kỳ hiện tại")
    public ResponseEntity<Map<String, Object>> allocateForCurrentSemester() {
        log.info("Manual page allocation triggered by SPSO");
        
        try {
            pageAllocationScheduler.manualAllocateForCurrentSemester();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Đã cấp phát trang thành công cho tất cả sinh viên");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error during manual page allocation", e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Lỗi khi cấp phát trang: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}
