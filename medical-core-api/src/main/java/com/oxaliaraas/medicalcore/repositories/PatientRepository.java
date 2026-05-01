package com.oxaliaraas.medicalcore.repositories;

import com.oxaliaraas.medicalcore.models.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientRepository extends JpaRepository<Patient, String> {
}
