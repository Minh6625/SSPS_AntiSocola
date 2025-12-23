package com.example.app.service;

import com.example.app.exception.ApplicationException;
import lombok.RequiredArgsConstructor;
import okhttp3.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * SERVICE: ConvertAPI
 * Xử lý việc convert file DOCX sang PDF bằng ConvertAPI
 * API Documentation: https://www.convertapi.com/doc/convert
 */
@Service
@RequiredArgsConstructor
public class ConvertApiService {
    
    private static final Logger logger = LoggerFactory.getLogger(ConvertApiService.class);
    private static final String CONVERT_API_BASE_URL = "https://v2.convertapi.com";
    
    @Value("${convertapi.secret:}")
    private String apiSecret;
    
    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(60, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .writeTimeout(60, TimeUnit.SECONDS)
            .build();
    
    /**
     * Convert DOCX file bytes sang PDF bytes
     * 
     * @param docxBytes Byte array của file DOCX
     * @return Byte array của file PDF đã convert
     * @throws IOException Nếu có lỗi khi convert
     */
    public byte[] convertDocxToPdf(byte[] docxBytes) throws IOException {
        if (docxBytes == null || docxBytes.length == 0) {
            throw new ApplicationException("File DOCX rỗng", 400);
        }
        
        logger.info("Bắt đầu convert DOCX sang PDF, size: {} bytes", docxBytes.length);
        
        // Build multipart request
        RequestBody fileBody = RequestBody.create(
            docxBytes, 
            MediaType.parse("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        );
        
        MultipartBody requestBody = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("File", "document.docx", fileBody)
                .addFormDataPart("StoreFile", "true")
                .build();
        
        // Build request URL với secret
        String url = String.format("%s/convert/docx/to/pdf?Secret=%s", 
                                   CONVERT_API_BASE_URL, apiSecret);
        
        Request request = new Request.Builder()
                .url(url)
                .post(requestBody)
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                String errorBody = response.body() != null ? response.body().string() : "Unknown error";
                logger.error("ConvertAPI error: status={}, body={}", response.code(), errorBody);
                throw new IOException("ConvertAPI failed: " + errorBody);
            }
            
            String responseBody = response.body().string();
            logger.debug("ConvertAPI response: {}", responseBody);
            
            // Parse JSON response để lấy URL của file PDF
            String pdfUrl = extractPdfUrl(responseBody);
            
            if (pdfUrl == null || pdfUrl.isEmpty()) {
                throw new IOException("Không tìm thấy URL của file PDF trong response");
            }
            
            // Download file PDF từ URL
            byte[] pdfBytes = downloadPdfFromUrl(pdfUrl);
            
            logger.info("Convert DOCX sang PDF thành công, PDF size: {} bytes", pdfBytes.length);
            return pdfBytes;
            
        } catch (IOException e) {
            logger.error("Lỗi khi convert DOCX sang PDF: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Extract PDF URL từ JSON response của ConvertAPI
     * Response format: {"ConversionCost":1,"Files":[{"FileName":"document.pdf","FileSize":12345,"Url":"https://..."}]}
     */
    private String extractPdfUrl(String jsonResponse) {
        try {
            // Simple JSON parsing (không dùng Jackson để giữ dependencies nhẹ)
            int urlIndex = jsonResponse.indexOf("\"Url\":\"");
            if (urlIndex == -1) {
                return null;
            }
            
            int urlStart = urlIndex + 7; // Length of "\"Url\":\""
            int urlEnd = jsonResponse.indexOf("\"", urlStart);
            
            if (urlEnd == -1) {
                return null;
            }
            
            return jsonResponse.substring(urlStart, urlEnd);
            
        } catch (Exception e) {
            logger.error("Lỗi khi parse JSON response: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Download file PDF từ URL
     */
    private byte[] downloadPdfFromUrl(String pdfUrl) throws IOException {
        Request request = new Request.Builder()
                .url(pdfUrl)
                .get()
                .build();
        
        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to download PDF: " + response.code());
            }
            
            if (response.body() == null) {
                throw new IOException("Response body is null");
            }
            
            return response.body().bytes();
        }
    }
}
