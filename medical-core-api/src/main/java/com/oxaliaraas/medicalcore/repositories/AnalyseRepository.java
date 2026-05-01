package com.oxaliaraas.medicalcore.repositories;

import com.oxaliaraas.medicalcore.models.Analyse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyseRepository extends JpaRepository<Analyse, String> {
    List<Analyse> findByTechnicienId(String technicienId);
    List<Analyse> findByStatutValidation(String statutValidation);
}
