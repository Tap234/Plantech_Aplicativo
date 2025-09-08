package com.example.plantech;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.github.cdimascio.dotenv.Dotenv; // Importe a nova biblioteca

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
    
        Dotenv dotenv = Dotenv.load();

        
        System.setProperty("DB_URL", dotenv.get("DB_URL"));
        System.setProperty("DB_USER", dotenv.get("DB_USER"));
        System.setProperty("DB_PASS", dotenv.get("DB_PASS"));
        System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET"));

        SpringApplication.run(DemoApplication.class, args);
    }
}