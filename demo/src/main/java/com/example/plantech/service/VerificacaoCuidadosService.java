package com.example.plantech.service;

import com.example.plantech.entity.Planta;
import com.example.plantech.entity.PlantaHistorico;
import com.example.plantech.repository.PlantaHistoricoRepository;
import com.example.plantech.repository.PlantaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class VerificacaoCuidadosService {

    @Autowired
    private PlantaRepository plantaRepository;

    @Autowired
    private PlantaHistoricoRepository historicoRepository;

    @Autowired
    private WeatherService weatherService;

    @Autowired
    private GeminiService geminiService;

    // Job 1: Monitoramento de Clima (Roda a cada 1 hora)
    @Scheduled(cron = "0 0 */1 * * *")
    public void monitorarClima() {
        List<Planta> plantas = plantaRepository.findAll();

        for (Planta p : plantas) {
            if (p.getLatitude() == null || p.getLongitude() == null || p.getDataUltimaRega() == null)
                continue;

            // 1. Contexto Externo (O Clima)
            String previsao = weatherService.obterPrevisao(p.getLatitude(), p.getLongitude());

            // 2. Contexto Interno (O Estado da Planta)
            long diasSemAgua = ChronoUnit.DAYS.between(p.getDataUltimaRega(), LocalDate.now());

            // Recupera o último diagnóstico
            List<PlantaHistorico> historico = historicoRepository.findTop3ByPlantaIdOrderByDataRegistroDesc(p.getId());
            String saudeAtual = historico.isEmpty() ? "Saúde desconhecida" : historico.get(0).getDiagnosticoIA();

            // Só aciona a IA se o clima for relevante
            boolean climaCritico = previsao.toLowerCase().contains("chuva") ||
                    previsao.toLowerCase().contains("rain") ||
                    previsao.toLowerCase().contains("céu limpo") ||
                    previsao.toLowerCase().contains("clear sky");

            if (climaCritico) {
                String prompt = String.format(
                        "Atue como um botânico. Tenho uma %s (Prefere: %s, %s). " +
                                "Estado ATUAL: Foi regada há %d dias. Último diagnóstico de saúde: '%s'. " +
                                "Previsão do TEMPO AGORA: '%s'. " +
                                "Pergunta: Devo deixá-la fora ou recolher? " +
                                "Responda APENAS com uma frase curta de ação direta.",
                        p.getEspecieIdentificada(), p.getPreferenciaSol(), p.getPreferenciaUmidade(),
                        diasSemAgua, saudeAtual, previsao);

                String acaoSugerida = geminiService.analisarAcaoClimatica(prompt);

                // Aqui você integraria com Firebase no futuro
                System.out.println("NOTIFICAÇÃO PARA " + p.getNome() + ": " + acaoSugerida);
            }
        }
    }

    // Job 2: Recomendação Diária (Roda todo dia às 06:00 da manhã)
    @Scheduled(cron = "0 0 6 * * *")
    public void gerarRecomendacaoDiaria() {
        List<Planta> plantas = plantaRepository.findAll();

        for (Planta p : plantas) {
            if (p.getDataUltimaRega() == null)
                continue;

            String clima = "Clima desconhecido";
            if (p.getLatitude() != null) {
                clima = weatherService.obterPrevisao(p.getLatitude(), p.getLongitude());
            }

            long diasDesdeRega = ChronoUnit.DAYS.between(p.getDataUltimaRega(), LocalDate.now());

            // Pega histórico de saúde para o prompt diário
            List<PlantaHistorico> historico = historicoRepository.findTop3ByPlantaIdOrderByDataRegistroDesc(p.getId());
            String saude = historico.isEmpty() ? "Estável" : historico.get(0).getDiagnosticoIA();

            String prompt = String.format("Gere uma frase curta de tarefa para hoje para uma %s. " +
                    "Contexto: Última rega há %d dias. Clima: %s. Saúde: %s.",
                    p.getEspecieIdentificada(), diasDesdeRega, clima, saude);

            String tarefaDoDia = geminiService.gerarTextoCurto(prompt);

            p.setRecomendacaoDiaria(tarefaDoDia);
            p.setAcaoDiariaRealizada(false);
            plantaRepository.save(p);
        }
    }

    // Job 3: Notificação de Rega (Roda todo dia às 07:00 da manhã)
    @Scheduled(cron = "0 0 7 * * *")
    public void verificarNecessidadeRega() {
        List<Planta> plantas = plantaRepository.findAll();
        LocalDate hoje = LocalDate.now();

        for (Planta p : plantas) {
            if (p.getProximaRega() != null && !p.getProximaRega().isAfter(hoje)) {
                // Aqui você integraria com Firebase/Push Notification
                System.out.println("🔔 HORA DE REGAR: " + p.getNome() + " (Era para: " + p.getProximaRega() + ")");
            }
        }
    }
}