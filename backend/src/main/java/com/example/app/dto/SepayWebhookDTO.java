package com.example.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * DTO for SePay Webhook payload
 * Docs: https://docs.sepay.vn/webhook.html
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SepayWebhookDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("gateway")
    private String gateway;  // Bank name (e.g., "MBBank")
    
    @JsonProperty("transactionDate")
    private String transactionDate;  // Format: yyyy-MM-dd HH:mm:ss
    
    @JsonProperty("accountNumber")
    private String accountNumber;  // Bank account number
    
    @JsonProperty("code")
    private String code;  // Transaction code (null if not set)
    
    @JsonProperty("content")
    private String content;  // Transfer content/description
    
    @JsonProperty("transferType")
    private String transferType;  // "in" or "out"
    
    @JsonProperty("transferAmount")
    private Long transferAmount;  // Amount in VND
    
    @JsonProperty("accumulated")
    private Long accumulated;  // Accumulated balance
    
    @JsonProperty("subAccount")
    private String subAccount;  // Sub account (if any)
    
    @JsonProperty("referenceCode")
    private String referenceCode;  // Bank reference code
    
    @JsonProperty("description")
    private String description;  // Full description
}
