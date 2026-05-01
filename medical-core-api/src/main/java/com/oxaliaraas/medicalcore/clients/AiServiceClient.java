package com.oxaliaraas.medicalcore.clients;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

@Component
public class AiServiceClient {
    
    private final RestTemplate restTemplate;
    private final String AI_SERVICE_URL = "http://127.0.0.1:8000/api/analyze";

    public AiServiceClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);  // 2s: Fail fast if server unreachable
        factory.setReadTimeout(12000);    // 12s: Limit wait for inference results
        this.restTemplate = new RestTemplate(factory);
    }

    public Map<String, Object> analyzeImage(String technicienId, byte[] fileBytes, String originalFilename) throws Exception {
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource fileAsResource = new ByteArrayResource(fileBytes){
            @Override
            public String getFilename(){ return originalFilename.endsWith(".png") ? originalFilename : originalFilename + ".png"; }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("technicienId", technicienId);
        body.add("file", fileAsResource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        System.out.println("🚀 [IA-CLIENT] Envoi de l'image (" + fileBytes.length/1024 + " KB) à FastAPI...");
        long startTime = System.currentTimeMillis();
        
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(AI_SERVICE_URL, requestEntity, Map.class);
            long duration = System.currentTimeMillis() - startTime;
            
            if (response.getStatusCode() == HttpStatus.OK) {
                System.out.println("✅ [IA-CLIENT] Analyse terminée en " + duration + "ms.");
                return response.getBody();
            } else {
                System.out.println("❌ [IA-CLIENT] Erreur HTTP " + response.getStatusCode());
                throw new RuntimeException("Erreur de communication avec l'API IA : " + response.getStatusCode());
            }
        } catch (Exception e) {
            System.err.println("🔥 [IA-CLIENT] Exception lors de l'appel FastAPI : " + e.getMessage());
            throw e;
        }
    }

    public Map<String, Object> triggerRetrain() {
        System.out.println("🧠 [IA-CLIENT] Demande de ré-entraînement envoyée à FastAPI...");
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity("http://127.0.0.1:8000/api/retrain", null, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("🔥 [IA-CLIENT] Erreur lors du retrain : " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "error");
            fallback.put("message", e.getMessage());
            return fallback;
        }
    }

    public Map<String, Object> chatWithAgent(Map<String, Object> payload) {
        System.out.println("💬 [IA-CLIENT] Envoi du message au chatbot IA...");
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity("http://127.0.0.1:8000/api/chat", payload, Map.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("🔥 [IA-CLIENT] Erreur lors du chat : " + e.getMessage());
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("reply", "Je suis désolé, le service IA est actuellement indisponible.");
            return fallback;
        }
    }
}
