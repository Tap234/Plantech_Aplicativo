// Crie este novo arquivo em com.example.plantech.service.FileStorageService.java

package com.example.plantech.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path root = Paths.get("uploads");

    public FileStorageService() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar a pasta para uploads!");
        }
    }

    public String save(MultipartFile file) {
        try {
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String newFilename = UUID.randomUUID().toString() + fileExtension;

            Files.copy(file.getInputStream(), this.root.resolve(newFilename));
            return newFilename;
        } catch (Exception e) {
            throw new RuntimeException("Não foi possível armazenar o arquivo. Erro: " + e.getMessage());
        }
    }
}