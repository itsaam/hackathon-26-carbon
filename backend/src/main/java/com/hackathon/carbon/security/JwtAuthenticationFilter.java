package com.hackathon.carbon.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Extraire le header "Authorization"
        String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String userEmail = null;

        // 2. Vérifier s'il commence par "Bearer "
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            userEmail = jwtUtils.getEmailFromToken(jwt);
        }

        // 3. Si on a un email et que l'utilisateur n'est pas encore authentifié dans le contexte
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtils.validateToken(jwt)) {
                // Pour l'instant on crée une auth simple sans rôles
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userEmail, null, Collections.emptyList());
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // 4. On informe Spring Security que l'utilisateur est OK
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        
        // 5. Continuer vers le contrôleur
        filterChain.doFilter(request, response);
    }
}