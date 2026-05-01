package com.oxaliaraas.medicalcore.repositories;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.oxaliaraas.medicalcore.models.ERole;
import com.oxaliaraas.medicalcore.models.Role;

@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {
    Optional<Role> findByName(ERole name);
}
