package com.example.plantech.repository;

import com.example.plantech.entity.PlantaHistorico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlantaHistoricoRepository extends JpaRepository<PlantaHistorico, Long> {

    // Busca os 3 últimos registros de histórico de uma planta específica,
    // ordenados do mais recente para o mais antigo.
    List<PlantaHistorico> findTop3ByPlantaIdOrderByDataRegistroDesc(Long plantaId);
}