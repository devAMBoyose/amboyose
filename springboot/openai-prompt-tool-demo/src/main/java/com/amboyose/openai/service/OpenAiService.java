package com.amboyose.openai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class OpenAiService {

    private final String apiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public OpenAiService(
            @Value("${openai.api.key:${OPENAI_API_KEY:}}") String apiKey) {
        this.apiKey = apiKey;
    }

    public String ask(String prompt) throws Exception {
        if (apiKey == null || apiKey.isBlank()) {
            return "Error: OPENAI_API_KEY is not set on the server.";
        }

        String requestBody = """
                {
                  "model": "gpt-4.1-mini",
                  "messages": [
                    { "role": "system", "content": "You are a helpful assistant for a developer portfolio demo called OpenAI Prompt Tool." },
                    { "role": "user", "content": %s }
                  ],
                  "max_tokens": 300
                }
                """
                .formatted(objectMapper.writeValueAsString(prompt));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            return "Error from OpenAI API: HTTP " + response.statusCode()
                    + " - " + response.body();
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode choices = root.path("choices");
        if (choices.isArray() && choices.size() > 0) {
            return choices.get(0).path("message").path("content").asText();
        }

        return "No response from OpenAI.";
    }
}
