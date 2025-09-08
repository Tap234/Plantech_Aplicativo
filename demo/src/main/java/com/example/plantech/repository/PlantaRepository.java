package com.example.plantech.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.plantech.entity.Planta;

public interface PlantaRepository extends JpaRepository<Planta, Long> {
    
}
