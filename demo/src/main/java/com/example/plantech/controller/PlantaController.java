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

        // 1. Recuperar histórico para contexto
        List<PlantaHistorico> historicoAnterior = historicoRepository.findTop3ByPlantaIdOrderByDataRegistroDesc(id);

        // 2. Analisar evolução com Gemini
        JSONObject analise = geminiService.analisarEvolucaoPlanta(planta, historicoAnterior, arquivoPath);

        // 3. Criar registro de histórico
        PlantaHistorico historico = new PlantaHistorico();
        historico.setPlanta(planta);
        historico.setFotoUrl(filename);
        historico.setDataRegistro(LocalDateTime.now());
        historico.setTipoAcao("FOTO_CONTROLE");

        if (analise.has("estadoSaude")) {
            planta.setEstadoSaude(analise.getString("estadoSaude"));
            historico.setDescricao("Estado de saúde: " + analise.getString("estadoSaude"));
        }

        if (analise.has("recomendacaoDiaria")) {
            planta.setRecomendacaoDiaria(analise.getString("recomendacaoDiaria"));
            historico.setRecomendacaoCurativa(analise.getString("recomendacaoDiaria"));
        }

        if (analise.has("diasParaProximaFoto")) {
            int dias = analise.getInt("diasParaProximaFoto");
            planta.setProximaFotoControle(LocalDateTime.now().plusDays(dias));
        } else {
            // Padrão: 7 dias se não especificado
            planta.setProximaFotoControle(LocalDateTime.now().plusDays(7));
        }

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

    // --- NOVOS ENDPOINTS PARA FLUXO OTIMIZADO ---

    @PostMapping("/identificar")
    public ResponseEntity<?> identificarPlanta(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Salvar arquivo temporariamente
            String filename = fileStorageService.save(file);
            Path arquivoPath = fileStorageService.load(filename);

            // 2. Chamar PlantNet (apenas identificação)
            PlantNetResponse respostaIA = plantNetService.identificarPlanta(arquivoPath);

            if (respostaIA == null || respostaIA.getResults() == null || respostaIA.getResults().isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Não foi possível identificar nenhuma planta na imagem."));
            }

            // 3. Retornar resultado + nome do arquivo temporário
            String especie = respostaIA.getResults().get(0).getSpecies().getScientificNameWithoutAuthor();
            Double score = respostaIA.getResults().get(0).getScore();

            return ResponseEntity.ok(Map.of(
                    "especieIdentificada", especie,
                    "probabilidadeIdentificacao", score,
                    "fotoTemp", filename,
                    "results", respostaIA.getResults()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao processar imagem."));
        }
    }

    @PostMapping("/confirmar")
    public ResponseEntity<?> confirmarPlanta(@RequestBody com.example.plantech.dto.PlantaConfirmacaoDTO dto,
            Authentication authentication) {
        try {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

            // 1. Criar Planta
            Planta planta = new Planta();
            planta.setNome(dto.getNome());
            planta.setDescricao(dto.getDescricao());
            planta.setUser(currentUser);
            planta.setFotoUrl(dto.getFotoTemp()); // Usa a foto já enviada anteriormente
            planta.setEspecieIdentificada(dto.getEspecieIdentificada());
            planta.setProbabilidadeIdentificacao(dto.getProbabilidadeIdentificacao());
            planta.setLatitude(dto.getLatitude());
            planta.setLongitude(dto.getLongitude());
            planta.setDataUltimaFotoControle(LocalDateTime.now());

            // 2. Análise Completa (Clima + Gemini) - SÓ AGORA
            String climaAtual = "Localização não definida";
            if (planta.getLatitude() != null && planta.getLongitude() != null) {
                climaAtual = weatherService.obterClimaAtual(planta.getLatitude(), planta.getLongitude());
            }

            Path arquivoPath = fileStorageService.load(dto.getFotoTemp());

            // Histórico vazio pois é nova
            JSONObject analiseGemini = geminiService.analisarPlanta(arquivoPath, planta.getEspecieIdentificada(),
                    climaAtual, List.of());

            // 3. Processar Resposta Gemini
            PlantaHistorico novoRegistro = new PlantaHistorico();
            novoRegistro.setPlanta(planta);
            novoRegistro.setFotoUrl(dto.getFotoTemp());
            novoRegistro.setDataRegistro(LocalDateTime.now());
            novoRegistro.setCondicaoTempo(climaAtual);
            novoRegistro.setTipoAcao("CADASTRO_INICIAL");

            if (analiseGemini.has("diagnostico"))
                novoRegistro.setDiagnosticoIA(analiseGemini.getString("diagnostico"));

            if (analiseGemini.has("tratamento")) {
                String rec = analiseGemini.getString("tratamento");
                if (analiseGemini.has("dica_clima"))
                    rec += "\n💡 Dica: " + analiseGemini.getString("dica_clima");
                novoRegistro.setRecomendacaoCurativa(rec);
            }

            if (analiseGemini.has("frequencia_rega_dias")) {
                int freq = analiseGemini.getInt("frequencia_rega_dias");
                planta.setFrequenciaRegaDias(freq);

                boolean regarAgora = analiseGemini.has("proxima_rega_imediata")
                        && analiseGemini.getBoolean("proxima_rega_imediata");

                if (regarAgora) {
                    planta.setProximaRega(LocalDate.now());
                    planta.setRecomendacaoDiaria("Sua planta precisa de rega hoje! "
                            + (analiseGemini.has("tratamento") ? analiseGemini.getString("tratamento") : ""));
                } else {
                    planta.setProximaRega(LocalDate.now().plusDays(freq));
                    if (analiseGemini.has("tratamento")) {
                        planta.setRecomendacaoDiaria(analiseGemini.getString("tratamento"));
                    } else {
                        planta.setRecomendacaoDiaria("Planta cadastrada com sucesso! Acompanhe as dicas diárias.");
                    }
                }
            }

            // GARANTIR DATA DA PRÓXIMA FOTO DE CONTROLE
            if (analiseGemini.has("diasParaProximaFoto")) {
                int dias = analiseGemini.getInt("diasParaProximaFoto");
                planta.setProximaFotoControle(LocalDateTime.now().plusDays(dias));
            } else {
                planta.setProximaFotoControle(LocalDateTime.now().plusDays(7)); // Padrão
            }

            // 4. Salvar
            Planta plantaSalva = plantaRepository.save(planta);
            novoRegistro.setPlanta(plantaSalva);
            historicoRepository.save(novoRegistro);

            // 5. Clima Detalhado (Alerta)
            try {
                if (plantaSalva.getLatitude() != null && plantaSalva.getLongitude() != null) {
                    String dadosClimaticos = weatherService.obterDadosClimaticosDetalhados(plantaSalva.getLatitude(),
                            plantaSalva.getLongitude());

                    org.json.JSONObject recomendacaoJson = geminiService.obterRecomendacaoClimaticaJson(
                            plantaSalva.getEspecieIdentificada(),
                            dadosClimaticos,
                            plantaSalva.getPreferenciaSol(),
                            plantaSalva.getPreferenciaUmidade());

                    String mensagem = recomendacaoJson.optString("mensagem", "Clima verificado.");
                    boolean alertaCritico = recomendacaoJson.optBoolean("alertaCritico", false);

                    // SEMPRE SALVA A MENSAGEM
                    plantaSalva.setRecomendacaoClimatica(mensagem);
                    plantaSalva.setAlertaClimatico(alertaCritico);

                    plantaRepository.save(plantaSalva);
                }
            } catch (Exception e) {
                System.err.println("Erro clima final: " + e.getMessage());
            }

            return ResponseEntity.ok(plantaSalva);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erro ao confirmar cadastro."));
        }
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

        // --- INTEGRAÇÃO CLIMA AO ATUALIZAR LOCALIZAÇÃO (ATUALIZADO) ---
        try {
            if (planta.getLatitude() != null && planta.getLongitude() != null) {
                System.out.println("--- DEBUG LOCATION UPDATE: Lat=" + planta.getLatitude() + ", Lon="
                        + planta.getLongitude() + " ---");
                String dadosClimaticos = weatherService.obterDadosClimaticosDetalhados(planta.getLatitude(),
                        planta.getLongitude());
                System.out.println("--- DEBUG LOCATION UPDATE: Dados Climáticos=" + dadosClimaticos + " ---");

                if (planta.getEspecieIdentificada() != null) {
                    org.json.JSONObject recomendacaoJson = geminiService.obterRecomendacaoClimaticaJson(
                            planta.getEspecieIdentificada(),
                            dadosClimaticos,
                            planta.getPreferenciaSol(),
                            planta.getPreferenciaUmidade());

                    String mensagem = recomendacaoJson.optString("mensagem", "Clima verificado.");
                    boolean alertaCritico = recomendacaoJson.optBoolean("alertaCritico", false);

                    // SEMPRE SALVA A MENSAGEM
                    planta.setRecomendacaoClimatica(mensagem);
                    planta.setAlertaClimatico(alertaCritico);

                    // Opcional: Atualizar recomendação diária se estiver genérica
                    if (planta.getRecomendacaoDiaria() != null
                            && planta.getRecomendacaoDiaria().contains("clima não está definido")) {
                        planta.setRecomendacaoDiaria("Clima atualizado! " + mensagem);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao atualizar clima na localização: " + e.getMessage());
            e.printStackTrace();
        }

        return ResponseEntity.ok(plantaRepository.save(planta));
    }
}