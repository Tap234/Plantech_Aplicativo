package com.example.plantech.job;

import com.example.plantech.entity.Planta;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class CuidadosJob {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private GeminiService geminiService;

    // Roda todos os dias às 08:00 da manhã
    @Scheduled(cron = "0 0 8 * * *")
    public void verificarCuidadosDiarios() {
        System.out.println("--- INICIANDO JOB DE CUIDADOS DIÁRIOS ---");
        List<Planta> plantas = plantaRepository.findAll();

        for (Planta planta : plantas) {
            try {
                // 1. Verificar se precisa de foto de controle
                if (planta.getProximaFotoControle() != null &&
                        LocalDateTime.now().isAfter(planta.getProximaFotoControle())) {

                    planta.setRecomendacaoDiaria(
                            "⚠️ Hora de enviar uma nova foto de controle! Ajude-nos a monitorar a evolução da sua "
                                    + planta.getNome());
                    plantaRepository.save(planta);
                    continue; // Pula para a próxima planta
                }

                // 2. Se não precisa de foto, gerar dica do dia baseada no estado de saúde
                String estado = planta.getEstadoSaude() != null ? planta.getEstadoSaude() : "Saudável";
                String prompt = String.format(
                        "A planta '%s' (%s) está com estado de saúde: '%s'. " +
                                "Gere uma dica curta e motivacional de cuidado para hoje (máximo 1 frase). " +
                                "Não fale de rega nem de clima, apenas cuidado geral ou curiosidade.",
                        planta.getNome(), planta.getEspecieIdentificada(), estado);

                String dica = geminiService.gerarTextoCurto(prompt);
                planta.setRecomendacaoDiaria(dica);
                planta.setAcaoDiariaRealizada(false); // Reseta o check diário

                plantaRepository.save(planta);

            } catch (Exception e) {
                System.err.println("Erro ao processar cuidados para planta " + planta.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("--- FIM DO JOB DE CUIDADOS DIÁRIOS ---");
    }
}
