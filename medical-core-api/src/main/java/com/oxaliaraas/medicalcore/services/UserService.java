package com.oxaliaraas.medicalcore.services;

import com.oxaliaraas.medicalcore.models.ERole;
import com.oxaliaraas.medicalcore.models.Role;
import com.oxaliaraas.medicalcore.models.User;
import com.oxaliaraas.medicalcore.payload.request.UserCreateRequest;
import com.oxaliaraas.medicalcore.payload.response.UserDTO;
import com.oxaliaraas.medicalcore.repositories.RoleRepository;
import com.oxaliaraas.medicalcore.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> getUserById(String id) {
        return userRepository.findById(id).map(UserDTO::fromEntity);
    }

    public UserDTO createUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        User user = new User();
        mapRequestToEntity(request, user);
        
        // Capture password from request, fallback if null
        String pwd = (request.getPassword() != null && !request.getPassword().trim().isEmpty()) 
            ? request.getPassword() 
            : "123456";
        user.setPassword(passwordEncoder.encode(pwd));

        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    public UserDTO updateUser(String id, UserCreateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Error: User not found."));

        // Check if email is being changed and if it already exists for another user
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        
        mapRequestToEntity(request, user);
        
        // Only update password if provided
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        User savedUser = userRepository.save(user);
        return UserDTO.fromEntity(savedUser);
    }

    private void mapRequestToEntity(UserCreateRequest request, User user) {
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setActive(request.isActive());

        // Assign Role
        Set<Role> roles = new HashSet<>();
        try {
            ERole eRole = ERole.valueOf("ROLE_" + request.getRole().toUpperCase());
            Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));
            roles.add(role);
        } catch (IllegalArgumentException e) {
            Role role = roleRepository.findByName(ERole.ROLE_USER)
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(role);
        }
        user.setRoles(roles);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
