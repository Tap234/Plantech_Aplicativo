package com.example.plantech.job;

import com.example.plantech.entity.Planta;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.service.GeminiService;
import com.example.plantech.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ClimaJob {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private GeminiService geminiService;

    // Executa a cada hora (cron: segundo minuto hora dia mes dia_semana)
    @Scheduled(cron = "0 0 * * * *")
    public void atualizarRecomendacoesClimaticas() {
        System.out.println("--- INICIANDO JOB DE CLIMA ---");
        List<Planta> plantas = plantaRepository.findAll();

        for (Planta planta : plantas) {
            try {
                if (planta.getLatitude() != null && planta.getLongitude() != null) {
                    String dadosClimaticos = weatherService.obterDadosClimaticosDetalhados(planta.getLatitude(),
                            planta.getLongitude());

                    String recomendacao = geminiService.gerarRecomendacaoClimatica(
                            planta.getEspecieIdentificada(),
                            dadosClimaticos,
                            planta.getPreferenciaSol(),
                            planta.getPreferenciaUmidade());

                    planta.setRecomendacaoClimatica(recomendacao);
                    plantaRepository.save(planta);
                    System.out.println("Atualizado clima para: " + planta.getNome());
                }
            } catch (Exception e) {
                System.err.println("Erro ao atualizar clima para planta " + planta.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("--- FIM JOB DE CLIMA ---");
    }
}
