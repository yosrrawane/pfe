package com.oxaliaraas.medicalcore.controllers;

import com.oxaliaraas.medicalcore.clients.AiServiceClient;
import com.oxaliaraas.medicalcore.services.StatisticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:4200")
public class AdminController {

    private final AiServiceClient aiServiceClient;
    private final StatisticsService statisticsService;

    public AdminController(AiServiceClient aiServiceClient, StatisticsService statisticsService) {
        this.aiServiceClient = aiServiceClient;
        this.statisticsService = statisticsService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(statisticsService.getGlobalKPIs());
    }

    @PostMapping("/retrain")
    public ResponseEntity<Map<String, Object>> retrainModel() {
        System.out.println("🔐 [ADMIN] Demande de ré-entraînement reçue.");
        Map<String, Object> result = aiServiceClient.triggerRetrain();
        return ResponseEntity.ok(result);
    }
}
