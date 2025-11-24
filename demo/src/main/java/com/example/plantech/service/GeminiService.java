package com.example.plantech.service;

import com.example.plantech.entity.PlantaHistorico;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final String API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

    public JSONObject analisarPlanta(Path caminhoImagem, String especie, String clima, List<PlantaHistorico> historicoRecente) {
        try {
            // 1. Prepara a imagem
            byte[] fileContent = Files.readAllBytes(caminhoImagem);
            String encodedImage = Base64.getEncoder().encodeToString(fileContent);

            // 2. Prepara o Contexto Histórico (Resumo dos últimos 3 registros)
            StringBuilder contextoHistorico = new StringBuilder();
            if (historicoRecente != null && !historicoRecente.isEmpty()) {
                contextoHistorico.append("Histórico recente da planta:\n");
                for (PlantaHistorico h : historicoRecente) {
                    contextoHistorico.append("- Em ").append(h.getDataRegistro()).append(": ").append(h.getDiagnosticoIA()).append("\n");
                }
            } else {
                contextoHistorico.append("Sem histórico anterior.");
            }

            // 3. Monta o Prompt Complexo
            String prompt = String.format(
                "Atue como um botânico sênior. Analise esta imagem de uma planta identificada como '%s'. " +
                "Contexto local: O clima agora é '%s'.\n%s\n" +
                "Tarefa: Identifique visualmente se há doenças, pragas ou deficiência de nutrientes. " +
                "Retorne APENAS um JSON com este formato: " +
                "{ \"saudavel\": boolean, \"diagnostico\": \"resumo do problema visual\", \"tratamento\": \"passos práticos\", \"dica_clima\": \"dica baseada no clima atual\" }",
                especie, clima, contextoHistorico.toString()
            );

            // 4. Estrutura da Requisição Gemini (Multimodal)
            JSONObject imagePart = new JSONObject()
                    .put("inline_data", new JSONObject()
                            .put("mime_type", "image/jpeg") // Ajustar se for png
                            .put("data", encodedImage));

            JSONObject textPart = new JSONObject().put("text", prompt);
            
            // Ordem importa: Texto primeiro ajuda a contextualizar a imagem
            JSONArray parts = new JSONArray().put(textPart).put(imagePart);
            
            JSONObject requestBody = new JSONObject()
                    .put("contents", new JSONArray().put(new JSONObject().put("parts", parts)));

            // 5. Envia
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
            String response = restTemplate.postForObject(API_URL + "?key=" + apiKey, request, String.class);

            // 6. Processa Resposta
            JSONObject jsonResponse = new JSONObject(response);
            String textResult = jsonResponse.getJSONArray("candidates")
                    .getJSONObject(0).getJSONObject("content").getJSONArray("parts")
                    .getJSONObject(0).getString("text");
            
            // Limpa Markdown do JSON
            String cleanJson = textResult.replace("```json", "").replace("```", "").trim();
            return new JSONObject(cleanJson);

        } catch (Exception e) {
            e.printStackTrace();
            // Retorno de fallback em caso de erro
            return new JSONObject().put("saudavel", true).put("diagnostico", "Erro na análise IA").put("tratamento", "Verificar logs");
        }
    }
}