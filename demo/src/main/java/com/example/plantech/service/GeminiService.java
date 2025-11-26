package com.example.plantech.service;

import com.example.plantech.entity.PlantaHistorico;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // Atualizado para gemini-2.0-flash conforme lista de modelos disponíveis
    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    // --- MÉTODOS PÚBLICOS (API da Classe) ---

    /**
     * Analisa uma planta nova (Cadastro) para dar o primeiro diagnóstico.
     */
    public JSONObject analisarPlanta(Path caminhoImagem, String especie, String clima,
            List<PlantaHistorico> historicoRecente) {
        // 1. Prepara o Contexto Histórico
        StringBuilder contextoHistorico = new StringBuilder();
        if (historicoRecente != null && !historicoRecente.isEmpty()) {
            contextoHistorico.append("Histórico recente da planta:\n");
            for (PlantaHistorico h : historicoRecente) {
                contextoHistorico.append("- Em ").append(h.getDataRegistro()).append(": ").append(h.getDiagnosticoIA())
                        .append("\n");
            }
        } else {
            contextoHistorico.append("Sem histórico anterior.");
        }

        // 2. Monta o Prompt Complexo para Identificação/Primeira Análise
        String prompt = String.format(
                "Atue como um botânico sênior. Analise esta imagem de uma planta identificada como '%s'. " +
                        "Contexto local: O clima agora é '%s'.\n%s\n" +
                        "Tarefa: Identifique visualmente se há doenças, pragas ou deficiência de nutrientes. " +
                        "Retorne APENAS um JSON com este formato (sem markdown): " +
                        "{ \"saudavel\": boolean, \"diagnostico\": \"resumo do problema visual\", \"tratamento\": \"passos práticos\", \"dica_clima\": \"dica baseada no clima atual\", \"frequencia_rega_dias\": numero_inteiro, \"proxima_rega_imediata\": boolean }",
                especie, clima, contextoHistorico.toString());

        return consultarGeminiImagem(caminhoImagem, prompt);
    }

    /**
     * Analisa APENAS a saúde da planta (Monitoramento / Foto de Controle).
     * Usado pelo endpoint /foto-controle.
     */
    public JSONObject analisarSaude(Path caminhoImagem, String promptPersonalizado) {
        // Se não vier prompt personalizado, usa um padrão de saúde
        String prompt = (promptPersonalizado != null && !promptPersonalizado.isEmpty())
                ? promptPersonalizado
                : "Analise esta imagem e identifique sinais de pragas, doenças ou deficiências. Retorne APENAS JSON: { \"saudavel\": boolean, \"diagnostico\": \"...\" }";

        return consultarGeminiImagem(caminhoImagem, prompt);
    }

    /**
     * Gera a frase do dia para o Job Diário.
     */
    public String gerarTextoCurto(String prompt) {
        return consultarGeminiTexto(prompt);
    }

    /**
     * Decide se a planta deve ser movida com base no clima (Job de Clima).
     */
    public String analisarAcaoClimatica(String prompt) {
        return consultarGeminiTexto(prompt);
    }

    /**
     * Recalcula a frequência de rega com base no histórico (Ajuste de Rega).
     */
    public int recalcularFrequencia(String prompt) {
        try {
            String resposta = consultarGeminiTexto(prompt);
            // Tenta extrair apenas números da resposta
            String numero = resposta.replaceAll("[^0-9]", "");
            if (numero.isEmpty())
                return 7; // Fallback seguro
            return Integer.parseInt(numero);
        } catch (Exception e) {
            return 7; // Fallback seguro em caso de erro
        }
    }

    // --- MÉTODOS PRIVADOS (Lógica Reaproveitável) ---

    /**
     * Envia apenas texto para o Gemini (Rápido e barato).
     */
    public String consultarGeminiTexto(String prompt) {
        try {
            JSONObject textPart = new JSONObject().put("text", prompt);
            JSONObject parts = new JSONObject().put("parts", new JSONArray().put(textPart));
            JSONObject requestBody = new JSONObject().put("contents", new JSONArray().put(parts));

            return enviarRequisicao(requestBody);

        } catch (Exception e) {
            e.printStackTrace();
            return "Erro na consulta IA";
        }
    }

    /**
     * Envia Imagem + Texto para o Gemini (Multimodal).
     */
    private JSONObject consultarGeminiImagem(Path caminhoImagem, String prompt) {
        try {
            // 1. Ler e Codificar Imagem
            byte[] fileContent = Files.readAllBytes(caminhoImagem);
            String encodedImage = Base64.getEncoder().encodeToString(fileContent);

            // 2. Estrutura da Requisição
            JSONObject imagePart = new JSONObject()
                    .put("inline_data", new JSONObject()
                            .put("mime_type", "image/jpeg") // Assumindo JPEG, idealmente detectar mime type
                            .put("data", encodedImage));

            JSONObject textPart = new JSONObject().put("text", prompt);

            JSONArray parts = new JSONArray().put(textPart).put(imagePart);
            JSONObject requestBody = new JSONObject()
                    .put("contents", new JSONArray().put(new JSONObject().put("parts", parts)));

            // 3. Envia e Trata Resposta
            String rawResponse = enviarRequisicao(requestBody);

            // Limpa Markdown (```json ... ```) se a IA colocar
            String cleanJson = rawResponse.replace("```json", "").replace("```", "").trim();
            return new JSONObject(cleanJson);

        } catch (Exception e) {
            e.printStackTrace();
            // Fallback JSON em caso de erro
            return new JSONObject().put("saudavel", true).put("diagnostico", "Erro ao processar imagem")
                    .put("tratamento", "Tente novamente");
        }
    }

    /**
     * Método central que faz o POST HTTP para a API do Google.
     */
    private String enviarRequisicao(JSONObject requestBody) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // DEBUG: Verificar se a chave está sendo carregada
        if (apiKey != null && apiKey.length() > 4) {
            System.out.println("--- DEBUG API KEY: " + apiKey.substring(0, 4) + "**** ---");
        } else {
            System.out.println("--- DEBUG API KEY: NULL ou INVÁLIDA ---");
        }

        HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
        try {
            String response = restTemplate.postForObject(API_URL + "?key=" + apiKey, request, String.class);
            JSONObject jsonResponse = new JSONObject(response);

            // Navega no JSON de resposta do Gemini para pegar o texto
            return jsonResponse.getJSONArray("candidates")
                    .getJSONObject(0).getJSONObject("content").getJSONArray("parts")
                    .getJSONObject(0).getString("text");
        } catch (HttpClientErrorException e) {
            System.err.println("--- GEMINI API ERROR ---");
            System.err.println("Status: " + e.getStatusCode());
            System.err.println("Body: " + e.getResponseBodyAsString());
            System.err.println("------------------------");
            throw e;
        }
    }
}