package com.example.plantech.service;

import com.example.plantech.dto.PlantNetResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.nio.file.Path;

@Service
public class PlantNetService {

    @Value("${plantnet.api.key}")
    private String apiKey;

    private final WebClient webClient;

    public PlantNetService(WebClient.Builder webClientBuilder) {
        try {
            // Configuração para IGNORAR ERROS DE SSL (Trust All)
            io.netty.handler.ssl.SslContext sslContext = io.netty.handler.ssl.SslContextBuilder
                    .forClient()
                    .trustManager(io.netty.handler.ssl.util.InsecureTrustManagerFactory.INSTANCE)
                    .build();

            org.springframework.http.client.reactive.ReactorClientHttpConnector httpClient = new org.springframework.http.client.reactive.ReactorClientHttpConnector(
                    reactor.netty.http.client.HttpClient.create().secure(t -> t.sslContext(sslContext)));

            this.webClient = webClientBuilder
                    .clientConnector(httpClient)
                    .baseUrl("https://my-api.plantnet.org")
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao configurar SSL inseguro", e);
        }
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
        } catch (WebClientResponseException e) {
            System.err.println("Erro API PlantNet: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            System.err.println("Erro genérico PlantNet: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}