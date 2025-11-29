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

    @Value("${emailjs.template-otp}")
    private String templateOtp;

    @Value("${emailjs.template-pinreset}")
    private String templatePinReset;

    @Value("${emailjs.public-key}")
    private String publicKey;

    @Value("${emailjs.app-name:BamBanking Demo}")
    private String appName;

    @Value("${emailjs.support-email:bamby.dev@gmail.com}")
    private String supportEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    private void sendTemplate(String templateId,
            String toEmail,
            String fullName,
            String otp) {

        String url = "https://api.emailjs.com/api/v1.0/email/send";

        Map<String, Object> body = new HashMap<>();
        body.put("service_id", serviceId);
        body.put("template_id", templateId);
        body.put("user_id", publicKey);

        Map<String, String> params = new HashMap<>();
        params.put("to_email", toEmail);
        params.put("to_name", fullName);
        params.put("otp", otp);
        params.put("app_name", appName);
        params.put("support_email", supportEmail);

        body.put("template_params", params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            System.out.println("EmailJS response: " + response.getStatusCode());
        } catch (Exception ex) {
            // Don't crash the app if email fails – just log
            System.err.println("Failed to send EmailJS message: " + ex.getMessage());
        }
    }

    /**
     * Send registration OTP email.
     */
    public void sendOtp(String toEmail, String fullName, String otp) {
        sendTemplate(templateOtp, toEmail, fullName, otp);
    }

    /**
     * Send PIN reset OTP email.
     */
    public void sendPinResetLink(String toEmail, String fullName, String otp) {
        sendTemplate(templatePinReset, toEmail, fullName, otp);
    }
}
