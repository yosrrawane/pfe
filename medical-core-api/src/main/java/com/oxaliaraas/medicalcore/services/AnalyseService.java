package com.oxaliaraas.medicalcore.services;

import com.oxaliaraas.medicalcore.models.Analyse;
import com.oxaliaraas.medicalcore.repositories.AnalyseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyseService {
    private final AnalyseRepository analyseRepository;
    private final com.oxaliaraas.medicalcore.repositories.AnalyseCorrectionRepository correctionRepository;
    private final com.oxaliaraas.medicalcore.repositories.ExamenCliniqueRepository examenCliniqueRepository;
    private final com.oxaliaraas.medicalcore.repositories.PatientRepository patientRepository;

    public AnalyseService(AnalyseRepository analyseRepository, 
                          com.oxaliaraas.medicalcore.repositories.AnalyseCorrectionRepository correctionRepository,
                          com.oxaliaraas.medicalcore.repositories.ExamenCliniqueRepository examenCliniqueRepository,
                          com.oxaliaraas.medicalcore.repositories.PatientRepository patientRepository) {
        this.analyseRepository = analyseRepository;
        this.correctionRepository = correctionRepository;
        this.examenCliniqueRepository = examenCliniqueRepository;
        this.patientRepository = patientRepository;
    }

    public List<Analyse> getAllAnalyses() {
        return analyseRepository.findAll();
    }

    public Optional<Analyse> getAnalyseById(String id) {
        return analyseRepository.findById(id);
    }

    public List<Analyse> getPendingAnalyses() {
        return analyseRepository.findByStatutValidation("EN_ATTENTE");
    }

    public List<Analyse> getHistoryAnalyses() {
        List<Analyse> results = analyseRepository.findByStatutValidation("VALIDE");
        results.addAll(analyseRepository.findByStatutValidation("REJETE"));
        results.addAll(analyseRepository.findByStatutValidation("CORRIGE"));
        return results;
    }

    public Optional<Analyse> validateAnalyse(String id, String medecinId, String commentaire, boolean isValide, 
                                            boolean toux, boolean fievre, boolean douleurThoracique, 
                                            String auscultation, String anomaliesRespiratoires, String signesCliniques) {
        return analyseRepository.findById(id).map(analyse -> {
            analyse.setStatutValidation(isValide ? "VALIDE" : "REJETE");
            analyse.setMedecinId(medecinId);
            analyse.setDateValidation(LocalDateTime.now());
            analyse.setCommentaireMedecin(commentaire);
            
            // Create or update Clinical Exam record
            com.oxaliaraas.medicalcore.models.ExamenClinique examen = analyse.getExamenClinique();
            if (examen == null) {
                examen = new com.oxaliaraas.medicalcore.models.ExamenClinique();
                examen.setAnalyse(analyse);
            }
            
            examen.setObservations(commentaire);
            examen.setToux(toux);
            examen.setFievre(fievre);
            examen.setDouleurThoracique(douleurThoracique);
            examen.setAuscultation(auscultation);
            examen.setAnomaliesRespiratoires(anomaliesRespiratoires);
            examen.setSignesCliniques(signesCliniques);
            examen.setDateValidation(LocalDateTime.now());
            
            examenCliniqueRepository.save(examen);
            analyse.setExamenClinique(examen);

            analyse.setPathologieFinale(analyse.getPathologies().isEmpty() ? "Inconnu" : analyse.getPathologies().get(0).getNom());
            analyse.setRapportCorrige(analyse.getRapport());
            return analyseRepository.save(analyse);
        });
    }

    public Optional<Analyse> correctAndValidate(String id, String medecinId, String pathoCorrigee, String rapportCorrige, String commentaire,
                                               boolean toux, boolean fievre, boolean douleurThoracique, 
                                               String auscultation, String anomaliesRespiratoires, String signesCliniques) {
        return analyseRepository.findById(id).map(analyse -> {
            // 1. Create the Correction record for ML
            com.oxaliaraas.medicalcore.models.AnalyseCorrection correction = new com.oxaliaraas.medicalcore.models.AnalyseCorrection();
            correction.setAnalyseId(id);
            correction.setPathologiePredite(analyse.getPathologies().isEmpty() ? "N/A" : analyse.getPathologies().get(0).getNom());
            correction.setPathologieCorrigee(pathoCorrigee);
            correction.setProbabilitePredite(analyse.getPathologies().isEmpty() ? 0 : analyse.getPathologies().get(0).getProbabilite());
            correction.setRapportOriginal(analyse.getRapport());
            correction.setRapportCorrige(rapportCorrige);
            correction.setValidatedBy(medecinId);
            correction.setDateCorrection(LocalDateTime.now());
            correctionRepository.save(correction);

            // 2. Update Clinical Exam
            com.oxaliaraas.medicalcore.models.ExamenClinique examen = analyse.getExamenClinique();
            if (examen == null) {
                examen = new com.oxaliaraas.medicalcore.models.ExamenClinique();
                examen.setAnalyse(analyse);
            }
            examen.setObservations(commentaire);
            examen.setToux(toux);
            examen.setFievre(fievre);
            examen.setDouleurThoracique(douleurThoracique);
            examen.setAuscultation(auscultation);
            examen.setAnomaliesRespiratoires(anomaliesRespiratoires);
            examen.setSignesCliniques(signesCliniques);
            examen.setDateValidation(LocalDateTime.now());
            examenCliniqueRepository.save(examen);
            analyse.setExamenClinique(examen);

            // 3. Update the main Analysis
            analyse.setStatutValidation("CORRIGE");
            analyse.setMedecinId(medecinId);
            analyse.setDateValidation(LocalDateTime.now());
            analyse.setCommentaireMedecin(commentaire);
            analyse.setRapportCorrige(rapportCorrige);
            analyse.setPathologieFinale(pathoCorrigee);
            analyse.setAEteCorrige(true);
            
            return analyseRepository.save(analyse);
        });
    }

    // Utilisé par le controller plus tard suite a une requete vers l'IA Python
    public Analyse saveAnalyse(Analyse analyse) {
        // Find or create patient
        com.oxaliaraas.medicalcore.models.Patient patient = patientRepository.findById(analyse.getPatientId())
                .orElseGet(() -> {
                    com.oxaliaraas.medicalcore.models.Patient newPatient = new com.oxaliaraas.medicalcore.models.Patient();
                    newPatient.setId(analyse.getPatientId());
                    newPatient.setAge(analyse.getAge());
                    newPatient.setSexe(analyse.getSexe());
                    newPatient.setPoids(analyse.getPoids());
                    newPatient.setTaille(analyse.getTaille());
                    newPatient.setAntecedents(analyse.getAntecedents());
                    return patientRepository.save(newPatient);
                });
        
        analyse.setPatient(patient);

        if(analyse.getPathologies() != null) {
            analyse.getPathologies().forEach(p -> p.setAnalyse(analyse));
        }
        return analyseRepository.save(analyse);
    }
}
