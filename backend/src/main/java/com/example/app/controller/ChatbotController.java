package com.example.app.controller;

import com.example.app.dto.ChatRequestDTO;
import com.example.app.dto.ChatResponseDTO;
import com.example.app.service.ChatbotService;
import com.example.app.util.JwtUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
@Tag(name = "Chatbot", description = "API AI Chatbot hỗ trợ sinh viên")
public class ChatbotController {

    private final ChatbotService chatbotService;
    private final JwtUtil jwtUtil;

    @PostMapping("/chat")
    @Operation(summary = "Gửi tin nhắn cho AI", description = "Gửi câu hỏi và nhận câu trả lời từ AI Assistant")
    public ResponseEntity<ChatResponseDTO> chat(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChatRequestDTO request) {
        
        try {
            String userId = extractUserId(authHeader);
            String response = chatbotService.chat(userId, request.getMessage());
            
            return ResponseEntity.ok(ChatResponseDTO.builder()
                    .success(true)
                    .message("OK")
                    .response(response)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.ok(ChatResponseDTO.builder()
                    .success(false)
                    .message(e.getMessage())
                    .response("⚠️ Có lỗi xảy ra. Vui lòng thử lại!")
                    .build());
        }
    }

    private String extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        return jwtUtil.extractUserId(token);
    }
}
