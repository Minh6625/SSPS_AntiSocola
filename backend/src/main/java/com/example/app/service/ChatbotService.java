package com.example.app.service;

import com.example.app.entity.Printer;
import com.example.app.entity.PageBalance;
import com.example.app.repository.PrinterRepository;
import com.example.app.repository.PageBalanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final PrinterRepository printerRepository;
    private final PageBalanceRepository pageBalanceRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${openrouter.api.key:}")
    private String openRouterApiKey;

    @Value("${openrouter.model:meta-llama/llama-3.2-3b-instruct:free}")
    private String openRouterModel;

    private static final String OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    
    // Danh sách model free để fallback khi bị rate limit
    private static final String[] FREE_MODELS = {
        "meta-llama/llama-3.2-3b-instruct:free",
        "qwen/qwen-2.5-72b-instruct:free",
        "google/gemini-2.0-flash-exp:free",
        "mistralai/mistral-7b-instruct:free"
    };

    private static final String SYSTEM_PROMPT = """
        Bạn là AI Assistant của hệ thống in ấn SPSS SIU (Student Printing Service System - Đại học Quốc tế Sài Gòn).
        
        Nhiệm vụ: Hướng dẫn sinh viên sử dụng hệ thống in ấn, giải đáp thắc mắc, hỗ trợ xử lý lỗi.
        
        Thông tin hệ thống:
        - File hỗ trợ: PDF, DOCX, DOC, PNG, JPG (max 50MB)
        - Giá: 500đ/trang A4, 1 trang A3 = 2 trang A4
        - Thanh toán: SePay (quét QR)
        - Hỗ trợ: Zalo 0937833154
        
        Các bước in:
        1. Tải tài liệu (menu "In tài liệu")
        2. Chọn máy in Active
        3. Cài đặt in
        4. Gửi lệnh in
        5. Lấy tài liệu tại máy in
        
        Trả lời ngắn gọn, tiếng Việt, có emoji.
        """;

    public String chat(String userId, String message) {
        try {
            // Lấy context data từ database
            String contextData = buildContextData(userId, message);
            
            // Gọi OpenRouter API
            return callOpenRouterAPI(message, contextData);
        } catch (Exception e) {
            log.error("Chatbot error: ", e);
            return "⚠️ Xin lỗi, tôi gặp sự cố. Vui lòng thử lại hoặc liên hệ Zalo 0937833154!";
        }
    }

    private String buildContextData(String userId, String message) {
        StringBuilder context = new StringBuilder();
        String lowerMessage = message.toLowerCase();

        // Nếu hỏi về số dư
        if (lowerMessage.contains("số dư") || lowerMessage.contains("trang") || 
            lowerMessage.contains("còn") || lowerMessage.contains("bao nhiêu")) {
            try {
                PageBalance balance = pageBalanceRepository.findById(userId).orElse(null);
                if (balance != null) {
                    int a4 = balance.getA4Balance();
                    context.append("\n\n[DỮ LIỆU THỰC TẾ] Số dư của user: ")
                           .append(a4).append(" trang A4. Có thể in ")
                           .append(a4 / 2).append(" trang A3.");
                } else {
                    context.append("\n\n[LƯU Ý] User chưa có thông tin số dư.");
                }
            } catch (Exception e) {
                log.warn("Cannot get balance: {}", e.getMessage());
            }
        }

        // Nếu hỏi về máy in
        if (lowerMessage.contains("máy in") || lowerMessage.contains("printer") || 
            lowerMessage.contains("trạng thái")) {
            try {
                List<Printer> allPrinters = printerRepository.findAll();
                long active = allPrinters.stream().filter(p -> "Active".equals(p.getStatus())).count();
                long offline = allPrinters.size() - active;
                
                List<String> activeNames = allPrinters.stream()
                    .filter(p -> "Active".equals(p.getStatus()))
                    .limit(5)
                    .map(Printer::getPrinterName)
                    .toList();

                context.append("\n\n[DỮ LIỆU THỰC TẾ] Có ").append(active)
                       .append(" máy in sẵn sàng, ").append(offline)
                       .append(" máy offline. Máy sẵn sàng: ")
                       .append(String.join(", ", activeNames));
            } catch (Exception e) {
                log.warn("Cannot get printers: {}", e.getMessage());
            }
        }

        return context.toString();
    }

    private String callOpenRouterAPI(String userMessage, String contextData) {
        if (openRouterApiKey == null || openRouterApiKey.isEmpty()) {
            log.error("OpenRouter API key not configured");
            return getFallbackResponse(userMessage);
        }

        String fullUserMessage = userMessage + contextData;
        
        // Thử từng model cho đến khi thành công
        for (String model : FREE_MODELS) {
            try {
                String result = tryCallWithModel(model, fullUserMessage);
                if (result != null) {
                    return result;
                }
            } catch (Exception e) {
                log.warn("Model {} failed: {}", model, e.getMessage());
            }
        }
        
        log.error("All models failed, returning fallback");
        return getFallbackResponse(userMessage);
    }
    
    private String tryCallWithModel(String model, String fullUserMessage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(new MediaType("application", "json", java.nio.charset.StandardCharsets.UTF_8));
            headers.set("Authorization", "Bearer " + openRouterApiKey);
            headers.set("HTTP-Referer", "http://localhost:3000");
            headers.set("X-Title", "SPSS SIU Chatbot");

            Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                    Map.of("role", "system", "content", SYSTEM_PROMPT),
                    Map.of("role", "user", "content", fullUserMessage)
                ),
                "max_tokens", 500,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Trying model: {}", model);
            ResponseEntity<Map> response = restTemplate.exchange(
                OPENROUTER_API_URL, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                if (response.getBody().containsKey("error")) {
                    log.warn("Model {} returned error", model);
                    return null;
                }
                
                List<Map> choices = (List<Map>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map message = (Map) choices.get(0).get("message");
                    if (message != null) {
                        String content = (String) message.get("content");
                        if (content != null && !content.isEmpty()) {
                            log.info("Success with model: {}", model);
                            return content;
                        }
                    }
                }
            }
            return null;
        } catch (Exception e) {
            log.warn("Model {} error: {}", model, e.getMessage());
            return null;
        }
    }

    private String getFallbackResponse(String message) {
        String lower = message.toLowerCase();
        
        if (lower.contains("tải") || lower.contains("upload")) {
            return "📄 **Cách tải tài liệu:**\n\n1. Vào menu \"In tài liệu\"\n2. Click \"Tải lên\" hoặc kéo thả file\n3. Hỗ trợ: PDF, DOCX, DOC, PNG, JPG\n4. Tối đa 50MB/file";
        }
        if (lower.contains("in") && !lower.contains("login")) {
            return "🖨️ **Cách in:**\n\n1. Chọn tài liệu\n2. Chọn máy in Active\n3. Cài đặt in\n4. Gửi lệnh in\n5. Lấy tài liệu tại máy in";
        }
        if (lower.contains("mua") || lower.contains("thanh toán")) {
            return "💳 **Mua trang:**\n\n1. Vào \"Số dư trang\"\n2. Nhập số trang\n3. Quét QR thanh toán\n4. Hệ thống tự cộng trang\n\n💰 Giá: 500đ/trang A4";
        }
        if (lower.contains("hỗ trợ") || lower.contains("liên hệ")) {
            return "📞 **Liên hệ:**\n\n📱 Zalo: 0937833154\n⏰ Thứ 2-6: 8:00-17:00";
        }
        
        return "👋 Xin chào! Tôi có thể giúp bạn về:\n• Kiểm tra số dư trang\n• Trạng thái máy in\n• Hướng dẫn in ấn\n• Mua thêm trang\n\nHãy hỏi tôi nhé!";
    }
}
