package com.amboyose.openai.controller;

import com.amboyose.openai.service.OpenAiService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
public class PromptController {

    private final OpenAiService openAiService;

    public PromptController(OpenAiService openAiService) {
        this.openAiService = openAiService;
    }

    // Renders the HTML page
    @GetMapping("/")
    public String index() {
        return "index";
    }

    // AJAX endpoint for prompts
    @PostMapping("/api/chat")
    @ResponseBody
    public Map<String, String> chat(@RequestBody Map<String, String> payload) {
        String prompt = payload.getOrDefault("prompt", "");
        try {
            String reply = openAiService.ask(prompt);
            return Map.of("reply", reply);
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("reply", "Error: " + e.getMessage());
        }
    }
}
