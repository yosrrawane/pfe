package com.oxaliaraas.medicalcore.repositories;

import com.oxaliaraas.medicalcore.models.AnalyseCorrection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyseCorrectionRepository extends JpaRepository<AnalyseCorrection, Long> {
    List<AnalyseCorrection> findByAnalyseId(String analyseId);
}
