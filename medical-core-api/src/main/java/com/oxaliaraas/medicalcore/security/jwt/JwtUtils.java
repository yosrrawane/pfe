package com.oxaliaraas.medicalcore.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${medicalcore.app.jwtSecret:oxaliaraasSecretKeyForJwtAuthenticationPleaseChangeInProdEnv}")
    private String jwtSecret;

    @Value("${medicalcore.app.jwtExpirationMs:86400000}")
    private int jwtExpirationMs;

    public String generateJwtToken(Authentication authentication) {
        com.oxaliaraas.medicalcore.security.services.UserDetailsImpl userPrincipal = 
            (com.oxaliaraas.medicalcore.security.services.UserDetailsImpl) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getEmail())) // Email is used as the unique username here
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }
    
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(getEncodedSecret()));
    }

    private String getEncodedSecret() {
        // Ensure secret is long enough for HS256 (at least 256 bits/32 bytes base64 encoded)
        if (jwtSecret.length() < 43) {
            String paddedSecret = jwtSecret + "12345678901234567890123456789012345678901234567890";
            return java.util.Base64.getEncoder().encodeToString(paddedSecret.substring(0, 43).getBytes());
        }
        return java.util.Base64.getEncoder().encodeToString(jwtSecret.getBytes());
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                   .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }

        return false;
    }
}
