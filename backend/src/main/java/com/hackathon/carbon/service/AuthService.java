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
    
    // Tes autres méthodes restent identiques
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
        
        // Optionnel : on pourrait hasher et mettre à jour le password ici aussi
        
        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .createdAt(user.getCreatedAt())
                .build();
    }
}