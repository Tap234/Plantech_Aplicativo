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
                boolean diaDeRega = planta.getProximaRega() != null && planta.getProximaRega().isEqual(LocalDate.now());

                String prompt = String.format(
                        "Atue como um botânico especialista. Planta: '%s' (%s). Estado: '%s'.\n" +
                                "Hoje %s dia de rega.\n" +
                                "Tarefa: Gere uma instrução de cuidado para hoje.\n" +
                                "Regras:\n" +
                                "1. NÃO fale sobre clima/tempo (já temos isso em outro lugar).\n" +
                                "2. Se for dia de rega, ESTIME a quantidade de água em ml para um vaso médio.\n" +
                                "3. Se a planta estiver doente, dê uma instrução prática de tratamento.\n" +
                                "4. Se estiver saudável e não for dia de rega, dê uma curiosidade ou dica de poda/limpeza.\n"
                                +
                                "5. Seja direto e instrutivo (ex: 'Aplique adubo NPK...', 'Limpe as folhas...').",
                        planta.getNome(), planta.getEspecieIdentificada(), estado, diaDeRega ? "É" : "NÃO É");

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
