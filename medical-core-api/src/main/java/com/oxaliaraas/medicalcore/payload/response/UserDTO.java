package com.oxaliaraas.medicalcore.payload.response;

import com.oxaliaraas.medicalcore.models.User;
import lombok.Data;
import java.util.stream.Collectors;

@Data
public class UserDTO {
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private boolean isActive;

    public static UserDTO fromEntity(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setActive(user.isActive());
        
        // Extract the main role string (strip "ROLE_" prefix to match Angular enum)
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            String fullRole = user.getRoles().iterator().next().getName().name();
            dto.setRole(fullRole.replace("ROLE_", ""));
        } else {
            dto.setRole("USER");
        }
        return dto;
    }
}
