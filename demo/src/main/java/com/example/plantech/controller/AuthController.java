package com.example.plantech.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.plantech.entity.Role;
import com.example.plantech.entity.User;
import com.example.plantech.repository.UserRepository;
import com.example.plantech.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;


    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {

        user.setSenha(passwordEncoder.encode(user.getSenha()));
        
        user.setRole(Role.ROLE_USER);

        return userRepository.save(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(user.getEmail(), user.getSenha())
        );

        if (authentication.isAuthenticated()) {
            return jwtService.generateToken((UserDetails) authentication.getPrincipal());
        } else {
            throw new RuntimeException("Authentication failed");
        }
    }
}