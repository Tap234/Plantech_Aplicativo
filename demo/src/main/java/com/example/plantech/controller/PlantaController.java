package com.example.plantech.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.plantech.entity.Planta;
import com.example.plantech.entity.User;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.repository.UserRepository;

@RestController
@RequestMapping("/api/plantas")
public class PlantaController {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<Planta> criarPlanta(@RequestBody Planta planta, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userEmail = userDetails.getUsername();
        
        User currentUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        planta.setUser(currentUser);
        Planta novaPlanta = plantaRepository.save(planta);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaPlanta);
    }

    @GetMapping
    public ResponseEntity<List<Planta>> listarPlantas(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Planta> plantas = plantaRepository.findByUser(currentUser);
        return ResponseEntity.ok(plantas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Planta> buscarPlantaPorId(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(planta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planta> atualizarPlanta(@PathVariable Long id, @RequestBody Planta plantaDetalhes, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta plantaExistente = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!plantaExistente.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantaExistente.setNome(plantaDetalhes.getNome());
        plantaExistente.setDescricao(plantaDetalhes.getDescricao());
        
        Planta plantaAtualizada = plantaRepository.save(plantaExistente);
        return ResponseEntity.ok(plantaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPlanta(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantaRepository.delete(planta);
        return ResponseEntity.noContent().build();
    }
}