package com.oxaliaraas.medicalcore.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
@Table(name = "examen_clinique")
public class ExamenClinique {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "analyse_id")
    @JsonBackReference
    private Analyse analyse;

    @Column(columnDefinition = "TEXT")
    private String observations;

    // Symptômes
    private boolean toux;
    private boolean fievre;
    private boolean douleurThoracique;

    // Examen physique
    @Column(columnDefinition = "TEXT")
    private String auscultation;
    @Column(columnDefinition = "TEXT")
    private String anomaliesRespiratoires;
    @Column(columnDefinition = "TEXT")
    private String signesCliniques;

    private LocalDateTime dateValidation;
}
