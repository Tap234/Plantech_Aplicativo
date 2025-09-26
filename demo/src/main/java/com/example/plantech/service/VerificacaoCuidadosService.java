package com.example.plantech.service;

import com.example.plantech.entity.Planta;
import com.example.plantech.repository.PlantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class VerificacaoCuidadosService {

    @Autowired
    private PlantaRepository plantaRepository;

    @Scheduled(fixedRate = 60000)
    public void verificarNecessidadeDeRega() {
        System.out.println("--- EXECUTANDO ROTINA AGENDADA: Verificando necessidade de rega... ---");

        List<Planta> todasAsPlantas = plantaRepository.findAll();

        for (Planta planta : todasAsPlantas) {
            if (planta.getFrequenciaRegaDias() != null && planta.getDataUltimaRega() != null) {

                LocalDate proximaRega = planta.getDataUltimaRega().plusDays(planta.getFrequenciaRegaDias());

                if (!proximaRega.isAfter(LocalDate.now())) {
                    System.out.println("ALERTA: A planta '" + planta.getNome() + "' (ID: " + planta.getId() + ") precisa ser regada!");
                    
                }
            }
        }
        System.out.println("--- FIM DA ROTINA AGENDADA ---");
    }
}