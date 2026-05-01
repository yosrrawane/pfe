package com.oxaliaraas.medicalcore.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "resultats_corriges")
public class AnalyseCorrection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "analyse_id", nullable = false)
    private String analyseId;

    private String pathologiePredite;
    private String pathologieCorrigee;
    private Integer probabilitePredite;
    
    @Column(columnDefinition = "TEXT")
    private String rapportOriginal;
    
    @Column(columnDefinition = "TEXT")
    private String rapportCorrige;

    private String validatedBy;
    private LocalDateTime dateCorrection;
}
