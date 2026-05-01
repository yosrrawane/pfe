package com.oxaliaraas.medicalcore.repositories;

import com.oxaliaraas.medicalcore.models.ExamenClinique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExamenCliniqueRepository extends JpaRepository<ExamenClinique, String> {
}
