package com.oxaliaraas.medicalcore.repositories;

import com.oxaliaraas.medicalcore.models.Pathologie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PathologieRepository extends JpaRepository<Pathologie, Long> {
}
