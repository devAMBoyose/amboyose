package com.bamby.jwt.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
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

    @Value("${emailjs.private-key:}")
    private String privateKey;

    // metadata (with default)
    @Value("${emailjs.app-name:BAMBY Portfolio Bank}")
    private String appName;

    @Value("${emailjs.support-email:bamby.dev@gmail.com}")
    private String supportEmail;

    private static final String EMAILJS_URL = "https://api.emailjs.com/api/v1.0/email/send";

    private final RestTemplate restTemplate = new RestTemplate();

    // ==========================
    // Core reusable sender
    // ==========================

    private boolean sendTemplate(String templateId,
            String toEmail,
            String fullName,
            String otp) {

        // basic safety checks
        if (toEmail == null || toEmail.isBlank()) {
            System.err.println("[EmailJsService] toEmail is empty. Email NOT sent.");
            return false;
        }
        if (serviceId == null || serviceId.isBlank()
                || templateId == null || templateId.isBlank()
                || publicKey == null || publicKey.isBlank()) {

            System.err.println("[EmailJsService] Missing EmailJS configuration. Email NOT sent.");
            System.err.println("  serviceId=" + serviceId
                    + " templateId=" + templateId
                    + " publicKey=" + publicKey);
            return false;
        }

        try {
            // ----------------------------
            // Template parameters
            // To Email field: {{email}}
            // Body variables: {{to_name}}, {{otp}}, {{support_email}}
            Map<String, Object> params = new HashMap<>();
            params.put("email", toEmail); // matches {{email}} in “To Email”
            params.put("to_name", fullName != null ? fullName : "");
            params.put("otp", otp); // matches {{otp}} in subject/body
            params.put("app_name", appName);
            params.put("support_email", supportEmail);

            // ----------------------------
            // Request payload
            // ----------------------------
            Map<String, Object> payload = new HashMap<>();
            payload.put("service_id", serviceId);
            payload.put("template_id", templateId);
            payload.put("user_id", publicKey); // public key

            if (privateKey != null && !privateKey.isBlank()) {
                payload.put("accessToken", privateKey); // private key (if enabled)
            }

            payload.put("template_params", params);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            System.out.println("[EmailJsService] Sending EmailJS request…");
            ResponseEntity<String> res = restTemplate.postForEntity(
                    EMAILJS_URL,
                    entity,
                    String.class);

            System.out.println("[EmailJsService] EmailJS HTTP status: " + res.getStatusCode());
            System.out.println("[EmailJsService] EmailJS response body: " + res.getBody());

            return res.getStatusCode().is2xxSuccessful();

        } catch (HttpClientErrorException.Forbidden ex) {
            System.err.println("[EmailJsService] 403 Forbidden – check 'API for non-browser apps' in EmailJS.");
            System.err.println(ex.getResponseBodyAsString());
            return false;
        } catch (HttpClientErrorException.UnprocessableEntity ex) {
            System.err.println("[EmailJsService] 422 Unprocessable Entity – often means recipient is empty.");
            System.err.println(ex.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            System.err.println("[EmailJsService] Error sending EmailJS message: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    // ==========================
    // Public methods used by controller
    // ==========================

    /** Signup / verification OTP */
    public boolean sendOtp(String toEmail, String fullName, String otp) {
        return sendTemplate(templateOtp, toEmail, fullName, otp);
    }

    /** PIN reset OTP */
    public boolean sendPinReset(String toEmail, String fullName, String otp) {
        return sendTemplate(templatePinReset, toEmail, fullName, otp);
    }

    /** Old name kept for compatibility with any existing controller code */
    public boolean sendPinResetLink(String toEmail, String fullName, String otp) {
        return sendPinReset(toEmail, fullName, otp);
    }
}
