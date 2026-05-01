package com.oxaliaraas.medicalcore.controllers;

import com.oxaliaraas.medicalcore.clients.AiServiceClient;
import com.oxaliaraas.medicalcore.models.Analyse;
import com.oxaliaraas.medicalcore.models.Pathologie;
import com.oxaliaraas.medicalcore.services.AnalyseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.ByteArrayInputStream;

@RestController
@RequestMapping("/api/analyses")
@CrossOrigin(origins = "*") // Full access for demo safety
public class AnalyseController {
    
    private final AnalyseService analyseService;
    private final AiServiceClient aiServiceClient;

    public AnalyseController(AnalyseService analyseService, AiServiceClient aiServiceClient) {
        this.analyseService = analyseService;
        this.aiServiceClient = aiServiceClient;
    }

    @GetMapping
    public List<Analyse> getAll() {
        return analyseService.getAllAnalyses();
    }

    @GetMapping("/pending")
    public List<Analyse> getPending() {
        List<Analyse> list = analyseService.getPendingAnalyses();
        list.forEach(a -> {
            a.setImageFaceUrl(null);
            a.setImageProfilUrl(null);
        });
        return list;
    }

    @GetMapping("/history")
    public List<Analyse> getHistory() {
        List<Analyse> list = analyseService.getHistoryAnalyses();
        list.forEach(a -> {
            a.setImageFaceUrl(null);
            a.setImageProfilUrl(null);
        });
        return list;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Analyse> getById(@PathVariable String id) {
        return analyseService.getAnalyseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint d'upload complet
    @PostMapping("/upload")
    public ResponseEntity<Analyse> uploadScanner(
            @RequestParam("uploaderId") String uploaderId, 
            @RequestParam("patientId") String patientId,
            @RequestParam("age") Integer age,
            @RequestParam("sexe") String sexe,
            @RequestParam(value = "poids", required = false) Double poids,
            @RequestParam(value = "taille", required = false) Double taille,
            @RequestParam(value = "antecedents", required = false) String antecedents,
            @RequestParam("imageFace") MultipartFile imageFace,
            @RequestParam("imageProfil") MultipartFile imageProfil,
            @RequestParam(value = "mock", required = false, defaultValue = "false") boolean forceMock) {
        
        byte[] faceBytes = null;
        byte[] profilBytes = null;
        try {
            System.out.println("📥 [CONTROLLER] Reçu upload patient: " + patientId);
            
            // --- PNG CONVERSION (FACE) ---
            BufferedImage faceImg = ImageIO.read(imageFace.getInputStream());
            ByteArrayOutputStream baosFace = new ByteArrayOutputStream();
            ImageIO.write(faceImg, "png", baosFace);
            faceBytes = baosFace.toByteArray();

            // --- PNG CONVERSION (PROFIL) ---
            BufferedImage profilImg = ImageIO.read(imageProfil.getInputStream());
            ByteArrayOutputStream baosProfil = new ByteArrayOutputStream();
            ImageIO.write(profilImg, "png", baosProfil);
            profilBytes = baosProfil.toByteArray();

            if (forceMock) {
                throw new RuntimeException("MODESIM_ACTIVE");
            }

            System.out.println("🚀 [AI] Appel IA pour la vue FACE uniquement...");
            Map<String, Object> aiResponse = aiServiceClient.analyzeImage(uploaderId, faceBytes, imageFace.getOriginalFilename());
            
            Analyse analyse = new Analyse();
            analyse.setTechnicienId(uploaderId);
            analyse.setPatientId(patientId);
            analyse.setAge(age);
            analyse.setSexe(sexe);
            analyse.setPoids(poids);
            analyse.setTaille(taille);
            analyse.setAntecedents(antecedents);
            analyse.setDateAnalyse(LocalDateTime.now());
            
            // Store URLs
            String faceBase64 = (String) aiResponse.get("convertedOriginal");
            if (faceBase64 != null && !faceBase64.isEmpty()) {
                analyse.setImageFaceUrl("data:image/png;base64," + faceBase64);
            } else {
                analyse.setImageFaceUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(faceBytes));
            }
            
            // Profil is just stored as base64 for demo (or S3 in real life)
            analyse.setImageProfilUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(profilBytes));

            analyse.setHeatmapBase64((String) aiResponse.get("heatmapBase64"));
            analyse.setScoreConfianceGlobal((Integer) aiResponse.get("scoreConfianceGlobal"));
            analyse.setRapport((String) aiResponse.get("rapport"));
            analyse.setStatutValidation("EN_ATTENTE");
            
            List<Map<String, Object>> pathos = (List<Map<String, Object>>) aiResponse.get("pathologies");
            List<Pathologie> pathologies = new ArrayList<>();
            for(Map<String, Object> map : pathos) {
                Pathologie p = new Pathologie();
                p.setNom((String) map.get("nom"));
                p.setProbabilite((Integer) map.get("probabilite"));
                pathologies.add(p);
            }
            analyse.setPathologies(pathologies);
            
            return ResponseEntity.ok(analyseService.saveAnalyse(analyse));
        } catch(Exception e) {
            System.err.println("⚠️ [FALLBACK] Simulation d'analyse...");
            Analyse analyseFictive = new Analyse();
            analyseFictive.setTechnicienId(uploaderId);
            analyseFictive.setPatientId(patientId);
            analyseFictive.setAge(age);
            analyseFictive.setSexe(sexe);
            analyseFictive.setPoids(poids);
            analyseFictive.setTaille(taille);
            analyseFictive.setAntecedents(antecedents);
            analyseFictive.setDateAnalyse(LocalDateTime.now());
            
            if (faceBytes != null) {
                analyseFictive.setImageFaceUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(faceBytes));
            }
            if (profilBytes != null) {
                analyseFictive.setImageProfilUrl("data:image/png;base64," + Base64.getEncoder().encodeToString(profilBytes));
            }
            
            analyseFictive.setScoreConfianceGlobal(92);
            analyseFictive.setRapport("Analyse simulée (Oxalia). Dyspnée suspectée.");
            analyseFictive.setStatutValidation("EN_ATTENTE");

            List<Pathologie> pathologiesFictives = new ArrayList<>();
            Pathologie p1 = new Pathologie();
            p1.setNom("Pneumonia");
            p1.setProbabilite(75);
            p1.setAnalyse(analyseFictive);
            pathologiesFictives.add(p1);
            analyseFictive.setPathologies(pathologiesFictives);
            
            return ResponseEntity.ok(analyseService.saveAnalyse(analyseFictive));
        }
    }

    // Endpoint de Validation (Médecin)
    @PostMapping("/{id}/validate")
    public ResponseEntity<Analyse> validate(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String medecinId = (String) payload.get("medecinId");
        String commentaire = (String) payload.get("commentaire");
        boolean isValide = payload.get("isValide") != null ? (boolean) payload.get("isValide") : true;
        
        // New clinical fields
        boolean toux = payload.get("toux") != null ? (boolean) payload.get("toux") : false;
        boolean fievre = payload.get("fievre") != null ? (boolean) payload.get("fievre") : false;
        boolean douleurThoracique = payload.get("douleurThoracique") != null ? (boolean) payload.get("douleurThoracique") : false;
        String auscultation = (String) payload.get("auscultation");
        String anomaliesRespiratoires = (String) payload.get("anomaliesRespiratoires");
        String signesCliniques = (String) payload.get("signesCliniques");

        return analyseService.validateAnalyse(id, medecinId, commentaire, isValide, 
                                            toux, fievre, douleurThoracique, 
                                            auscultation, anomaliesRespiratoires, signesCliniques)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Endpoint de Correction (Médecin)
    @PostMapping("/{id}/correct")
    public ResponseEntity<Analyse> correct(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        String medecinId = (String) payload.get("medecinId");
        String pathoCorrigee = (String) payload.get("pathoCorrigee");
        String rapportCorrige = (String) payload.get("rapportCorrige");
        String commentaire = (String) payload.get("commentaire");

        // New clinical fields
        boolean toux = payload.get("toux") != null ? (boolean) payload.get("toux") : false;
        boolean fievre = payload.get("fievre") != null ? (boolean) payload.get("fievre") : false;
        boolean douleurThoracique = payload.get("douleurThoracique") != null ? (boolean) payload.get("douleurThoracique") : false;
        String auscultation = (String) payload.get("auscultation");
        String anomaliesRespiratoires = (String) payload.get("anomaliesRespiratoires");
        String signesCliniques = (String) payload.get("signesCliniques");

        return analyseService.correctAndValidate(id, medecinId, pathoCorrigee, rapportCorrige, commentaire,
                                               toux, fievre, douleurThoracique, 
                                               auscultation, anomaliesRespiratoires, signesCliniques)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/valider")
    public ResponseEntity<Analyse> valider(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String observations = payload.get("observations");
        String medecinId = "DOC-PRO"; // Simulation ID médecin
        return analyseService.validateAnalyse(id, medecinId, observations, true, false, false, false, null, null, null)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
