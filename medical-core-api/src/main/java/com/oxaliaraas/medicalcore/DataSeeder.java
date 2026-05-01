package com.oxaliaraas.medicalcore;

import com.oxaliaraas.medicalcore.models.ERole;
import com.oxaliaraas.medicalcore.models.Role;
import com.oxaliaraas.medicalcore.models.User;
import com.oxaliaraas.medicalcore.repositories.RoleRepository;
import com.oxaliaraas.medicalcore.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Set;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize Roles individually if they don't exist
        ensureRole(ERole.ROLE_ADMIN);
        ensureRole(ERole.ROLE_MEDECIN);
        ensureRole(ERole.ROLE_TECHNICIEN);
        ensureRole(ERole.ROLE_PATIENT);
        ensureRole(ERole.ROLE_USER);
        
        System.out.println("✅ Vérification des rôles terminée !");

        // Always ensure demo Technicien account exists (regardless of count)
        if (userRepository.findByEmail("tech@medapp.com").isEmpty()) {
            Role technicienRole = roleRepository.findByName(ERole.ROLE_TECHNICIEN).orElseThrow();
            User technicien = new User("Martin", "Sophie", "tech@medapp.com", passwordEncoder.encode("tech"));
            Set<Role> techRoles = new HashSet<>();
            techRoles.add(technicienRole);
            technicien.setRoles(techRoles);
            userRepository.save(technicien);
            System.out.println("✅ Compte Technicien (tech@medapp.com/tech) créé !");
        }

        // Ensure Admin demo account exists
        if (userRepository.findByEmail("admin@medapp.com").isEmpty()) {
            Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN).orElseThrow();
            User admin = new User("Admin", "Super", "admin@medapp.com", passwordEncoder.encode("admin"));
            Set<Role> adminRoles = new HashSet<>();
            adminRoles.add(adminRole);
            admin.setRoles(adminRoles);
            userRepository.save(admin);
            System.out.println("✅ Compte Admin (admin@medapp.com/admin) créé !");
        }

        // Ensure Medecin demo account exists
        if (userRepository.findByEmail("medecin@medapp.com").isEmpty()) {
            Role medecinRole = roleRepository.findByName(ERole.ROLE_MEDECIN).orElseThrow();
            User medecin = new User("Dupont", "Jean", "medecin@medapp.com", passwordEncoder.encode("medecin"));
            Set<Role> medecinRoles = new HashSet<>();
            medecinRoles.add(medecinRole);
            medecin.setRoles(medecinRoles);
            userRepository.save(medecin);
            System.out.println("✅ Compte Médecin (medecin@medapp.com/medecin) créé !");
        }
    }

    private void ensureRole(ERole roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            roleRepository.save(new Role(roleName));
            System.out.println("   + Rôle ajouté : " + roleName);
        }
    }
}
