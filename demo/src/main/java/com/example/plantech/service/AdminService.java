package com.example.plantech.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.plantech.entity.Planta;
import com.example.plantech.entity.User;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.repository.UserRepository;
import java.util.List;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PlantaRepository plantaRepository;

    @Transactional
    public void deleteUserAndAssociatedPlants(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário com ID " + userId + " não encontrado."));

        List<Planta> plantasParaDeletar = plantaRepository.findByUser(user);

        if (plantasParaDeletar != null && !plantasParaDeletar.isEmpty()) {
            plantaRepository.deleteAll(plantasParaDeletar);
        }

        userRepository.delete(user);
    }
}