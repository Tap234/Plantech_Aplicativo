package com.example.plantech.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.plantech.entity.Role;
import com.example.plantech.entity.User;
import com.example.plantech.repository.UserRepository;
import com.example.plantech.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> listarTodosUsuarios() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deletarUsuario(@PathVariable Long id) {
        adminService.deleteUserAndAssociatedPlants(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{id}/promote")
    public ResponseEntity<User> promoverParaAdmin(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                user.setRole(Role.ROLE_ADMIN);
                User updatedUser = userRepository.save(user);
                return ResponseEntity.ok(updatedUser);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/users/{id}/demote")
    public ResponseEntity<User> rebaixarParaUser(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> {
                user.setRole(Role.ROLE_USER);
                User updatedUser = userRepository.save(user);
                return ResponseEntity.ok(updatedUser);
            })
            .orElse(ResponseEntity.notFound().build());
    }
}