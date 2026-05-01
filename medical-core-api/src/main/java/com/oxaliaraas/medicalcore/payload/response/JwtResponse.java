package com.oxaliaraas.medicalcore.payload.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String nom;
    private String prenom;
    private String email;
    private List<String> roles;

    public JwtResponse(String accessToken, String id, String nom, String prenom, String email, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.roles = roles;
    }
}
