package com.hackathon.carbon.service;

import com.hackathon.carbon.dto.AuthRequest;
import com.hackathon.carbon.dto.AuthResponse;
import com.hackathon.carbon.dto.UserDTO;
import com.hackathon.carbon.entity.User;
import com.hackathon.carbon.repository.UserRepository;
import com.hackathon.carbon.security.JwtUtils; // Ajouté
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder; // Ajouté
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder; // Ajouté
    private final JwtUtils jwtUtils; // Ajouté

    public AuthResponse register(AuthRequest request) {
        // 1. On hashe le mot de passe avant de sauvegarder
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword())) 
                .fullName(request.getFullName())
                .role(request.getRole() != null ? request.getRole() : "USER")
                .build();

        User savedUser = userRepository.save(user);

        // 2. On génère un vrai token JWT
        String token = jwtUtils.generateToken(savedUser.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToDTO(savedUser))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        // 1. Chercher l'utilisateur
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        // 2. Vérifier le mot de passe (on compare le clair avec le hash)
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // 3. Générer le token
        String token = jwtUtils.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(mapToDTO(user))
                .build();
    }
    
    // Autres méthodes
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return mapToDTO(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserDTO updateUser(Long id, AuthRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    public java.util.List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}