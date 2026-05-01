package com.oxaliaraas.medicalcore.models;

import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Data
@Entity
public class Pathologie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nom;
    private Integer probabilite;

    @ManyToOne
    @JoinColumn(name = "analyse_id")
    @JsonBackReference
    private Analyse analyse;
}
