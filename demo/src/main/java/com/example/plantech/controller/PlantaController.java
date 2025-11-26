package com.example.plantech.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.example.plantech.dto.LocalizacaoRequestDTO;
import com.example.plantech.dto.PlantaRequestDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.web.multipart.MultipartFile;
import com.example.plantech.service.FileStorageService;
import com.example.plantech.entity.Planta;
import com.example.plantech.entity.User;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.repository.UserRepository;
import com.example.plantech.service.PlantNetService;
import com.example.plantech.dto.PlantNetResponse;
import java.nio.file.Path;
import com.example.plantech.entity.PlantaHistorico;
import com.example.plantech.repository.PlantaHistoricoRepository;
import com.example.plantech.service.WeatherService;
import com.example.plantech.service.GeminiService;
import org.json.JSONObject;

@RestController
@RequestMapping("/api/plantas")
public class PlantaController {

    @Autowired
    private PlantaRepository plantaRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private FileStorageService fileStorageService;
    @Autowired
    private PlantNetService plantNetService;
    @Autowired
    private PlantaHistoricoRepository historicoRepository;
    @Autowired
    private WeatherService weatherService;
    @Autowired
    private GeminiService geminiService;

    // --- 1. MÉTODOS DE MONITORAMENTO (NOVOS) ---

    @PostMapping("/{id}/foto-controle")
    public ResponseEntity<PlantaHistorico> enviarFotoControle(@PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Planta planta = plantaOpt.get();

        String filename = fileStorageService.save(file);

        Path arquivoPath = fileStorageService.load(filename);

        String prompt = "Analise esta imagem atual da planta " + planta.getNome() +
                " (Espécie: " + planta.getEspecieIdentificada() + "). " +
                "Identifique apenas problemas de saúde (pragas, fungos, seca).";

        JSONObject analise = geminiService.analisarSaude(arquivoPath, prompt);

        PlantaHistorico historico = new PlantaHistorico();
        historico.setPlanta(planta);
        if (analise.has("diagnostico"))
            historico.setDiagnosticoIA(analise.getString("diagnostico"));
        historico.setFotoUrl(filename);
        historico.setDataRegistro(LocalDateTime.now());

        planta.setDataUltimaFotoControle(LocalDateTime.now());
        plantaRepository.save(planta);

        return ResponseEntity.ok(historicoRepository.save(historico));
    }

    @PostMapping("/{id}/regar")
    public ResponseEntity<Planta> registrarRega(@PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Planta planta = plantaOpt.get();

        LocalDate dataRega = (body != null && body.containsKey("data"))
                ? LocalDate.parse(body.get("data"))
                : LocalDate.now();

        planta.setDataUltimaRega(dataRega);

        List<PlantaHistorico> ultimosRegistros = historicoRepository.findTop3ByPlantaIdOrderByDataRegistroDesc(id);
        StringBuilder sb = new StringBuilder();
        for (PlantaHistorico h : ultimosRegistros) {
            sb.append("Data: ").append(h.getDataRegistro()).append(", Diagnóstico: ").append(h.getDiagnosticoIA())
                    .append("; ");
        }
        String historicoCuidados = sb.toString();

        String prompt = "O usuário regou a " + planta.getNome() + " em " + dataRega + ". " +
                "O intervalo anterior era " + planta.getFrequenciaRegaDias() + " dias. " +
                "Histórico recente: " + historicoCuidados + ". Devo manter ou alterar a frequência? " +
                "Responda apenas o número de dias.";

        int novosDias = geminiService.recalcularFrequencia(prompt);
        planta.setFrequenciaRegaDias(novosDias);

        if (novosDias > 0) {
            planta.setProximaRega(dataRega.plusDays(novosDias));
        }

        plantaRepository.save(planta);
        return ResponseEntity.ok(planta);
    }

    @PostMapping("/{id}/check-diario")
    public ResponseEntity<Void> confirmarAcao(@PathVariable Long id) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();
        Planta p = plantaOpt.get();

        p.setAcaoDiariaRealizada(true);

        PlantaHistorico log = new PlantaHistorico();
        log.setPlanta(p);
        log.setDataRegistro(LocalDateTime.now());
        log.setRecomendacaoCurativa("Tarefa diária realizada: " + p.getRecomendacaoDiaria());

        plantaRepository.save(p);
        historicoRepository.save(log);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<?> uploadFotoPlanta(@PathVariable Long id, @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Planta planta = plantaOpt.get();
        String filename = fileStorageService.save(file);
        planta.setFotoUrl(filename);

        try {
            Path arquivoPath = fileStorageService.load(filename);

            if (planta.getEspecieIdentificada() == null || planta.getEspecieIdentificada().isEmpty()) {
                PlantNetResponse respostaIA = plantNetService.identificarPlanta(arquivoPath);

                // VERIFICAÇÃO DE SUCESSO DA IDENTIFICAÇÃO
                if (respostaIA == null || respostaIA.getResults() == null || respostaIA.getResults().isEmpty()) {
                    plantaRepository.delete(planta);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error",
                                    "Não foi possível identificar nenhuma planta na imagem. Tente novamente."));
                }

                planta.setEspecieIdentificada(
                        respostaIA.getResults().get(0).getSpecies().getScientificNameWithoutAuthor());
                planta.setProbabilidadeIdentificacao(respostaIA.getResults().get(0).getScore());
            }

            String climaAtual = "Localização não definida";
            if (planta.getLatitude() != null && planta.getLongitude() != null) {
                climaAtual = weatherService.obterClimaAtual(planta.getLatitude(), planta.getLongitude());
            }

            List<PlantaHistorico> historicoRecente = historicoRepository
                    .findTop3ByPlantaIdOrderByDataRegistroDesc(planta.getId());
            JSONObject analiseGemini = geminiService.analisarPlanta(arquivoPath, planta.getEspecieIdentificada(),
                    climaAtual, historicoRecente);

            System.out.println("--- DEBUG GEMINI RESPONSE ---");
            System.out.println(analiseGemini.toString());
            System.out.println("-----------------------------");

            PlantaHistorico novoRegistro = new PlantaHistorico();
            novoRegistro.setPlanta(planta);
            novoRegistro.setFotoUrl(filename);
            novoRegistro.setDataRegistro(LocalDateTime.now());
            novoRegistro.setCondicaoTempo(climaAtual);

            if (analiseGemini.has("diagnostico"))
                novoRegistro.setDiagnosticoIA(analiseGemini.getString("diagnostico"));
            if (analiseGemini.has("tratamento")) {
                String rec = analiseGemini.getString("tratamento");
                if (analiseGemini.has("dica_clima"))
                    rec += "\n💡 Dica: " + analiseGemini.getString("dica_clima");
                novoRegistro.setRecomendacaoCurativa(rec);
            }

            // --- LÓGICA DE CUIDADOS IMEDIATOS (NOVO) ---
            if (analiseGemini.has("frequencia_rega_dias")) {
                int freq = analiseGemini.getInt("frequencia_rega_dias");
                planta.setFrequenciaRegaDias(freq);

                boolean regarAgora = analiseGemini.has("proxima_rega_imediata")
                        && analiseGemini.getBoolean("proxima_rega_imediata");
                if (regarAgora) {
                    planta.setProximaRega(LocalDate.now());
                    planta.setRecomendacaoDiaria("Atenção! Sua planta precisa de água hoje. "
                            + (analiseGemini.has("dica_clima") ? analiseGemini.getString("dica_clima") : ""));
                } else {
                    planta.setProximaRega(LocalDate.now().plusDays(freq));
                    if (analiseGemini.has("dica_clima")) {
                        planta.setRecomendacaoDiaria(analiseGemini.getString("dica_clima"));
                    }
                }
            }

            historicoRepository.save(novoRegistro);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }

        return ResponseEntity.ok(plantaRepository.save(planta));
    }

    // --- 2. MÉTODOS CRUD PADRÃO ---

    @PostMapping
    public ResponseEntity<Planta> criarPlanta(@RequestBody PlantaRequestDTO plantaDTO, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        Planta novaPlanta = new Planta();
        novaPlanta.setNome(plantaDTO.getNome());
        novaPlanta.setDescricao(plantaDTO.getDescricao());
        novaPlanta.setUser(currentUser);

        return ResponseEntity.status(HttpStatus.CREATED).body(plantaRepository.save(novaPlanta));
    }

    @GetMapping
    public ResponseEntity<List<Planta>> listarPlantas(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(plantaRepository.findByUser(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Planta> buscarPlantaPorId(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(plantaOpt.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planta> atualizarPlanta(@PathVariable Long id, @RequestBody Planta plantaDetalhes,
            Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Planta plantaExistente = plantaOpt.get();
        plantaExistente.setNome(plantaDetalhes.getNome());
        plantaExistente.setDescricao(plantaDetalhes.getDescricao());
        plantaExistente.setFrequenciaRegaDias(plantaDetalhes.getFrequenciaRegaDias());

        return ResponseEntity.ok(plantaRepository.save(plantaExistente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPlanta(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isPresent()) {
            plantaRepository.delete(plantaOpt.get());
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/localizacao")
    public ResponseEntity<Planta> atualizarLocalizacaoPlanta(@PathVariable Long id,
            @RequestBody LocalizacaoRequestDTO localizacao, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty())
            return ResponseEntity.notFound().build();

        Planta planta = plantaOpt.get();
        planta.setLatitude(localizacao.getLatitude());
        planta.setLongitude(localizacao.getLongitude());

        return ResponseEntity.ok(plantaRepository.save(planta));
    }
}