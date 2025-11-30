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

    // Optional: only used if you later turn on "Use Private Key"
    @Value("${emailjs.private-key:}")
    private String privateKey;

    @Value("${emailjs.app-name}")
    private String appName;

    @Value("${emailjs.support-email}")
    private String supportEmail;

    private final RestTemplate restTemplate = new RestTemplate();

    // ------------------------------
    // Internal helper
    // ------------------------------
    private void sendTemplate(String templateId,
            String toEmail,
            String fullName,
            String otp) {

        String url = "https://api.emailjs.com/api/v1.0/email/send";

        Map<String, Object> body = new HashMap<>();
        body.put("service_id", serviceId);
        body.put("template_id", templateId);
        body.put("user_id", publicKey);

        // only add accessToken if you actually set emailjs.private-key
        if (privateKey != null && !privateKey.isBlank()) {
            body.put("accessToken", privateKey);
        }

        Map<String, String> params = new HashMap<>();
        params.put("to_email", toEmail);
        params.put("to_name", fullName);
        params.put("otp", otp);
        params.put("app_name", appName);
        params.put("support_email", supportEmail);

        body.put("template_params", params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // some setups like to see an origin header:
        headers.add("Origin", "http://localhost");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            System.out.println("=== EmailJS SEND START ===");
            System.out.println("Service: " + serviceId +
                    " | Template: " + templateId +
                    " | To: " + toEmail);

            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            System.out.println("EmailJS HTTP status: " + response.getStatusCode());
            System.out.println("EmailJS response body: " + response.getBody());
            System.out.println("=== EmailJS SEND END ===");
        } catch (Exception ex) {
            System.err.println("EmailJS ERROR: " + ex.getMessage());
            ex.printStackTrace();
        }
    }

    // ------------------------------
    // Public methods used by controller
    // ------------------------------

    /** Registration OTP */
    public void sendOtp(String toEmail, String fullName, String otp) {
        sendTemplate(templateOtp, toEmail, fullName, otp);
    }

    /** PIN reset OTP (new name) */
    public void sendPinReset(String toEmail, String fullName, String otp) {
        sendTemplate(templatePinReset, toEmail, fullName, otp);
    }

    /**
     * PIN reset OTP (old name, kept so your existing controller code still works)
     */
    public void sendPinResetLink(String toEmail, String fullName, String otp) {
        sendPinReset(toEmail, fullName, otp);
    }
}
