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

    // OTP for signup / verification
    @Value("${emailjs.template-otp}")
    private String templateOtp;

    // OTP for PIN reset
    @Value("${emailjs.template-pinreset}")
    private String templatePinReset;

    @Value("${emailjs.public-key}")
    private String publicKey;

    // optional
    @Value("${emailjs.private-key:}")
    private String privateKey;

    // just metadata; we give defaults so the app still runs even if missing
    @Value("${emailjs.app-name:BAMBY Portfolio Bank}")
    private String appName;

    @Value("${emailjs.support-email:bamby.dev@gmail.com}")
    private String supportEmail;

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

            System.err.println("[EmailJsService] Missing EmailJS configuration. Email NOT sent.");
            System.err.println("  serviceId=" + serviceId
                    + " templateId=" + templateId
                    + " publicKey=" + publicKey);
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("service_id", serviceId);
            payload.put("template_id", templateId);
            payload.put("user_id", publicKey);

            // these names must match your EmailJS template variables
            Map<String, Object> params = new HashMap<>();
            params.put("to_email", toEmail);
            params.put("to_name", fullName != null ? fullName : "");
            params.put("otp_code", otp); // change if your template variable name is different
            params.put("app_name", appName);
            params.put("support_email", supportEmail);

            payload.put("template_params", params);

            if (privateKey != null && !privateKey.isBlank()) {
                payload.put("accessToken", privateKey);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            System.out.println("[EmailJsService] Sending EmailJS request...");
            ResponseEntity<String> res = restTemplate.postForEntity(
                    "https://api.emailjs.com/api/v1.0/email/send",
                    entity,
                    String.class);

            System.out.println("[EmailJsService] EmailJS HTTP status: " + res.getStatusCode());
            System.out.println("[EmailJsService] EmailJS response body: " + res.getBody());

        } catch (Exception e) {
            System.err.println("[EmailJsService] Error sending EmailJS message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ==========================
    // Public methods used by controller
    // ==========================

    /** Signup / verification OTP */
    public void sendOtp(String toEmail, String fullName, String otp) {
        sendTemplate(templateOtp, toEmail, fullName, otp);
    }

    /** PIN reset OTP */
    public void sendPinReset(String toEmail, String fullName, String otp) {
        sendTemplate(templatePinReset, toEmail, fullName, otp);
    }

    /** Old method kept for compatibility with existing controller code */
    public void sendPinResetLink(String toEmail, String fullName, String otp) {
        sendPinReset(toEmail, fullName, otp);
    }
}
