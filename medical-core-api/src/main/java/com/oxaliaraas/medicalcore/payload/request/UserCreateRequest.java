package com.oxaliaraas.medicalcore.payload.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserCreateRequest {
    @NotBlank
    private String nom;

    @NotBlank
    private String prenom;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String role; // e.g. "TECHNICIEN", "MEDECIN", "ADMIN"
    
    private String password;

    @JsonProperty("isActive")
    private boolean active;
}
