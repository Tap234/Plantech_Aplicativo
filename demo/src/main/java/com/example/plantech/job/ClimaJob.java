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

                    org.json.JSONObject recomendacaoJson = geminiService.obterRecomendacaoClimaticaJson(
                            planta.getEspecieIdentificada(),
                            dadosClimaticos,
                            planta.getPreferenciaSol(),
                            planta.getPreferenciaUmidade());

                    String mensagem = recomendacaoJson.optString("mensagem", "Clima verificado.");
                    boolean alertaCritico = recomendacaoJson.optBoolean("alertaCritico", false);

                    planta.setRecomendacaoClimatica(mensagem);
                    plantaRepository.save(planta);

                    if (alertaCritico) {
                        System.out.println(
                                "⚠️ ALERTA CRÍTICO DE CLIMA PARA: " + planta.getNome() + " -> ENVIAR NOTIFICAÇÃO PUSH");
                        // TODO: Integrar com serviço de notificação (Firebase/Expo)
                    } else {
                        System.out.println("Clima OK para: " + planta.getNome());
                    }
                }
            } catch (Exception e) {
                System.err.println("Erro ao atualizar clima para planta " + planta.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("--- FIM JOB DE CLIMA ---");
    }
}
