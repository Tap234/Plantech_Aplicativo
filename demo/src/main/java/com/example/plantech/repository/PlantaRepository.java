package com.example.plantech.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.plantech.entity.Planta;
import java.util.List;
import com.example.plantech.entity.User;

public interface PlantaRepository extends JpaRepository<Planta, Long> {
    List<Planta> findByUser(User user);
}
