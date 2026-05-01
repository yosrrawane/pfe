package com.oxaliaraas.medicalcore.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Data
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    private String id; // Patient ID entered by technician

    private Integer age;
    private String sexe;
    private Double poids;
    private Double taille;
    @Column(columnDefinition = "TEXT")
    private String antecedents;
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Analyse> analyses;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}
