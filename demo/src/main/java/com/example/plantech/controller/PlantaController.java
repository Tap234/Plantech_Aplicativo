package com.example.plantech.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/plantas")

public class PlantaController {
    @GetMapping
    public String ListarPlantas(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return "Olá, " + userDetails.getUsername() + "! Aqui estão suas plantas.";
    }
}
