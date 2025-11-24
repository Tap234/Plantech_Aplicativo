package com.example.plantech.service;

import com.example.plantech.dto.PlantNetResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Path;

@Service
public class PlantNetService {

    @Value("${plantnet.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public PlantNetService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://my-api.plantnet.org").build();
    }

    public PlantNetResponse identificarPlanta(Path caminhoArquivo) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("images", new FileSystemResource(caminhoArquivo));
            builder.part("organs", "auto");

            return webClient.post()
                    .uri(uriBuilder -> uriBuilder.path("/v2/identify/all")
                            .queryParam("api-key", apiKey)
                            .build())
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(PlantNetResponse.class)
                    .block();
        } catch (Exception e) {
            e.printStackTrace();
            return null; 
        }
    }
}