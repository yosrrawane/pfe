package com.oxaliaraas.medicalcore.config;

import com.oxaliaraas.medicalcore.models.Analyse;
import com.oxaliaraas.medicalcore.models.Pathologie;
import com.oxaliaraas.medicalcore.repositories.AnalyseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
public class DemoDataInitializer implements CommandLineRunner {

    private final AnalyseRepository analyseRepository;
    private final Random random = new Random();

    public DemoDataInitializer(AnalyseRepository analyseRepository) {
        this.analyseRepository = analyseRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (analyseRepository.count() == 0) {
            System.out.println("🌱 [DEMO-DATA] Initialisation des données de démonstration...");
            
            List<String> pathonames = Arrays.asList("Pneumonia", "Cardiomegaly", "Effusion", "Infiltration", "Atelectasis", "Nodule");
            List<String> statuses = Arrays.asList("VALIDE", "VALIDE", "VALIDE", "CORRIGE", "REJETE", "EN_ATTENTE");

            for (int i = 0; i < 25; i++) {
                Analyse analyse = new Analyse();
                analyse.setTechnicienId("TECH-001");
                analyse.setDateAnalyse(LocalDateTime.now().minusDays(random.nextInt(30)).minusHours(random.nextInt(24)));
                analyse.setPatientId("PAT-" + (1000 + i));
                analyse.setAge(20 + random.nextInt(60));
                analyse.setSexe(random.nextBoolean() ? "Homme" : "Femme");
                analyse.setImageFaceUrl("assets/images/lung_scan_placeholder.jpg");
                analyse.setImageProfilUrl("assets/images/lung_scan_placeholder.jpg");
                analyse.setScoreConfianceGlobal(70 + random.nextInt(28));
                analyse.setRapport("Rapport automatique généré par Oxalia AI v2.0 - Analyse thoracique standard.");
                analyse.setStatutValidation(statuses.get(random.nextInt(statuses.size())));
                
                if (!"EN_ATTENTE".equals(analyse.getStatutValidation())) {
                    analyse.setMedecinId("MED-123");
                    analyse.setDateValidation(analyse.getDateAnalyse().plusHours(random.nextInt(48) + 1));
                    analyse.setCommentaireMedecin("Validation effectuée après relecture clinique.");
                }

                if ("CORRIGE".equals(analyse.getStatutValidation())) {
                    analyse.setAEteCorrige(true);
                    analyse.setPathologieFinale(pathonames.get(random.nextInt(pathonames.size())));
                    analyse.setRapportCorrige("Rapport ajusté par le médecin : Détection manuelle de " + analyse.getPathologieFinale());
                }

                List<Pathologie> pathologies = new ArrayList<>();
                int numPathos = random.nextInt(3) + 1;
                for (int j = 0; j < numPathos; j++) {
                    Pathologie p = new Pathologie();
                    p.setNom(pathonames.get(random.nextInt(pathonames.size())));
                    p.setProbabilite(40 + random.nextInt(55));
                    p.setAnalyse(analyse);
                    pathologies.add(p);
                }
                analyse.setPathologies(pathologies);
                
                analyseRepository.save(analyse);
            }
            
            System.out.println("✅ [DEMO-DATA] 25 analyses injectées avec succès pour la démonstration.");
        }
    }
}
