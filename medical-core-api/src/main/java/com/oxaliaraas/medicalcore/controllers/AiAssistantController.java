package com.oxaliaraas.medicalcore.controllers;

import com.oxaliaraas.medicalcore.clients.AiServiceClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/assistant")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiAssistantController {

    private final AiServiceClient aiServiceClient;

    public AiAssistantController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> payload) {
        // Here we could add security checks, context enrichment from PostgreSQL, etc.
        Map<String, Object> response = aiServiceClient.chatWithAgent(payload);
        return ResponseEntity.ok(response);
    }
}
