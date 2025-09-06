package com.example.plantech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv; // Importe a nova biblioteca

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        // Carrega as variáveis do arquivo .env
        Dotenv dotenv = Dotenv.load();

        // Configura as variáveis de sistema para o Spring Boot usar
        System.setProperty("DB_URL", dotenv.get("DB_URL"));
        System.setProperty("DB_USER", dotenv.get("DB_USER"));
        System.setProperty("DB_PASS", dotenv.get("DB_PASS"));

        // Inicia a aplicação Spring Boot
        SpringApplication.run(DemoApplication.class, args);
    }
}