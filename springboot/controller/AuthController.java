package com.bamby.jwt.controller;

import com.bamby.jwt.model.AppUser;
import com.bamby.jwt.payload.AuthRequest;
import com.bamby.jwt.payload.AuthResponse;
import com.bamby.jwt.repo.UserRepository;
import com.bamby.jwt.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin // extra safety for CORS
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AuthRequest request) {
        if (userRepo.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken.");
        }

        AppUser user = AppUser.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .role("ROLE_USER")
                .build();

        userRepo.save(user);

        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles("USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    request.getUsername(), request.getPassword());
            authManager.authenticate(authToken);
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Invalid username or password.");
        }

        var userDetails = org.springframework.security.core.userdetails.User
                .withUsername(request.getUsername())
                .password("N/A")
                .roles("USER")
                .build();

        String token = jwtService.generateToken(userDetails);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    // Simple protected endpoint to test
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        return ResponseEntity.ok("Hello, you are authenticated ✅");
    }
}
