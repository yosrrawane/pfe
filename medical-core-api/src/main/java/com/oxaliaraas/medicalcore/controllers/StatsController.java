package com.oxaliaraas.medicalcore.controllers;

import com.oxaliaraas.medicalcore.repositories.AnalyseRepository;
import com.oxaliaraas.medicalcore.repositories.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:4200")
public class StatsController {

    private final UserRepository userRepository;
    private final AnalyseRepository analyseRepository;

    public StatsController(UserRepository userRepository, AnalyseRepository analyseRepository) {
        this.userRepository = userRepository;
        this.analyseRepository = analyseRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("activeUsers", userRepository.countByIsActiveTrue());
        stats.put("totalAnalys", analyseRepository.count());
        
        return ResponseEntity.ok(stats);
    }
}
