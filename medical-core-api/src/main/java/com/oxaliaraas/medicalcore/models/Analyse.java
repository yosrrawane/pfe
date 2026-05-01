package com.oxaliaraas.medicalcore.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Data
@Entity
@Table(name = "analyses")
public class Analyse {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String technicienId;
    private LocalDateTime dateAnalyse;
    // Relationship with Patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Patient patient;
    
    // Virtual fields for backward compatibility or easier access if needed
    // (Or just use patient.getAge())
    @Column(name = "patient_id_str")
    private String patientId; // We keep this for API simplicity
    private Integer age;
    private String sexe;
    private Double poids;
    private Double taille;
    @Column(columnDefinition = "TEXT")
    private String antecedents;

    @Column(columnDefinition = "TEXT")
    private String imageFaceUrl;

    @Column(columnDefinition = "TEXT")
    private String imageProfilUrl;
    
    @Column(columnDefinition = "TEXT")
    private String heatmapBase64;

    private Integer scoreConfianceGlobal;
    
    @Column(columnDefinition = "TEXT")
    private String rapport;
    
    private String statutValidation; // EN_ATTENTE, VALIDE, REJETE
    private String medecinId;
    private LocalDateTime dateValidation;
    
    @Column(columnDefinition = "TEXT")
    private String commentaireMedecin;
    
    @Column(columnDefinition = "TEXT")
    private String rapportCorrige;
    
    private String pathologieFinale;
    private Boolean aEteCorrige = false;

    @OneToMany(mappedBy = "analyse", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Pathologie> pathologies;

    @OneToOne(mappedBy = "analyse", cascade = CascadeType.ALL)
    @JsonManagedReference
    private ExamenClinique examenClinique;
}
