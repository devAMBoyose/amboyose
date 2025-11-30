package com.bamby.jwt.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailJsService {

    @Value("${emailjs.service-id}")
    private String serviceId;

    // Template for signup / verification OTP
    @Value("${emailjs.template-signup-otp}")
    private String templateSignupOtp;

    // Template for PIN reset OTP
    @Value("${emailjs.template-pin-reset}")
    private String templatePinReset;

    // EmailJS PUBLIC KEY (user_id)
    @Value("${emailjs.public-key}")
    private String publicKey;

    // EmailJS PRIVATE KEY (optional – access token). Leave blank if not used.
    @Value("${emailjs.private-key:}")
    private String privateKey;

    private final RestTemplate restTemplate = new RestTemplate();

    // ==========================
    // Core sender
    // ==========================

    private void sendTemplate(String templateId,
            String toEmail,
            String fullName,
            String otp) {

        if (serviceId == null || serviceId.isBlank()
                || templateId == null || templateId.isBlank()
                || publicKey == null || publicKey.isBlank()) {

            System.err.println("[EmailJsService] Missing EmailJS configuration. Email not sent.");
            System.err.println(" serviceId=" + serviceId
                    + " templateId=" + templateId
                    + " publicKey=" + publicKey);
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("service_id", serviceId);
            payload.put("template_id", templateId);
            payload.put("user_id", publicKey);

            // IMPORTANT: These keys must match your EmailJS template vars
            Map<String, Object> params = new HashMap<>();
            params.put("to_email", toEmail);
            params.put("to_name", fullName != null ? fullName : "");
            params.put("otp_code", otp); // change name if your template uses a different variable
            payload.put("template_params", params);

            if (privateKey != null && !privateKey.isBlank()) {
                payload.put("accessToken", privateKey);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.emailjs.com/api/v1.0/email/send",
                    entity,
                    String.class);

            System.out.println("[EmailJsService] EmailJS response: status="
                    + response.getStatusCode()
                    + " body=" + response.getBody());

        } catch (Exception e) {
            System.err.println("[EmailJsService] Failed to send EmailJS message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==========================
    // Public methods used by controller
    // ==========================

    /** Signup OTP (bank-verify-otp) */
    public void sendOtp(String toEmail, String fullName, String otp) {
        sendTemplate(templateSignupOtp, toEmail, fullName, otp);
    }

    /** PIN reset OTP (new name) */
    public void sendPinReset(String toEmail, String fullName, String otp) {
        sendTemplate(templatePinReset, toEmail, fullName, otp);
    }

    /**
     * PIN reset OTP (old method name, kept for compatibility).
     */
    public void sendPinResetLink(String toEmail, String fullName, String otp) {
        sendPinReset(toEmail, fullName, otp);
    }
}
