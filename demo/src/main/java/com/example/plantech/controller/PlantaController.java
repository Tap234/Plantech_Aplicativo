package com.example.plantech.controller;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.plantech.dto.LocalizacaoRequestDTO;
import com.example.plantech.dto.PlantaRequestDTO;
import java.time.LocalDate;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import com.example.plantech.service.FileStorageService;
import com.example.plantech.entity.Planta;
import com.example.plantech.entity.User;
import com.example.plantech.repository.PlantaRepository;
import com.example.plantech.repository.UserRepository;
import com.example.plantech.service.PlantNetService;
import com.example.plantech.dto.PlantNetResponse;
import java.nio.file.Path;

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

    @PostMapping
    public ResponseEntity<Planta> criarPlanta(@RequestBody PlantaRequestDTO plantaDTO, Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String userEmail = userDetails.getUsername();
     
        User currentUser = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Planta novaPlanta = new Planta();
        novaPlanta.setNome(plantaDTO.getNome());
        novaPlanta.setDescricao(plantaDTO.getDescricao());
        novaPlanta.setUser(currentUser);
     
        Planta plantaSalva = plantaRepository.save(novaPlanta);
        return ResponseEntity.status(HttpStatus.CREATED).body(plantaSalva);
    }

    @GetMapping
    public ResponseEntity<List<Planta>> listarPlantas(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User currentUser = userRepository.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        List<Planta> plantas = plantaRepository.findByUser(currentUser);
        return ResponseEntity.ok(plantas);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Planta> buscarPlantaPorId(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(planta);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Planta> atualizarPlanta(@PathVariable Long id, @RequestBody Planta plantaDetalhes, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta plantaExistente = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!plantaExistente.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantaExistente.setNome(plantaDetalhes.getNome());
        plantaExistente.setDescricao(plantaDetalhes.getDescricao());

        plantaExistente.setFrequenciaRegaDias(plantaDetalhes.getFrequenciaRegaDias());
        plantaExistente.setDataUltimaRega(plantaDetalhes.getDataUltimaRega());
        
        Planta plantaAtualizada = plantaRepository.save(plantaExistente);
        return ResponseEntity.ok(plantaAtualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPlanta(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        plantaRepository.delete(planta);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/regar")
    public ResponseEntity<Planta> registrarRega(@PathVariable Long id, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        planta.setDataUltimaRega(LocalDate.now());
        Planta plantaAtualizada = plantaRepository.save(planta);
        return ResponseEntity.ok(plantaAtualizada);
    }

    @PostMapping("/{id}/foto")
    public ResponseEntity<Planta> uploadFotoPlanta(@PathVariable Long id, @RequestParam("file") MultipartFile file, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String filename = fileStorageService.save(file);
        planta.setFotoUrl(filename);
        try {
            Path arquivoPath = fileStorageService.load(filename);
            PlantNetResponse respostaIA = plantNetService.identificarPlanta(arquivoPath);

            if (respostaIA != null && respostaIA.getResults() != null && !respostaIA.getResults().isEmpty()) {
                PlantNetResponse.Result topResult = respostaIA.getResults().get(0);
                
                planta.setEspecieIdentificada(topResult.getSpecies().getScientificNameWithoutAuthor());
                planta.setProbabilidadeIdentificacao(topResult.getScore());
                
                if (topResult.getSpecies().getCommonNames() != null && !topResult.getSpecies().getCommonNames().isEmpty()) {
                }
            }
        } catch (Exception e) {
            System.err.println("Erro ao identificar planta: " + e.getMessage());
        }

        Planta plantaAtualizada = plantaRepository.save(planta);
        return ResponseEntity.ok(plantaAtualizada);
    }

    @PutMapping("/{id}/localizacao")
    public ResponseEntity<Planta> atualizarLocalizacaoPlanta(@PathVariable Long id, @RequestBody LocalizacaoRequestDTO localizacao, Authentication authentication) {
        Optional<Planta> plantaOpt = plantaRepository.findById(id);
        if (plantaOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Planta planta = plantaOpt.get();
        String userEmail = ((UserDetails) authentication.getPrincipal()).getUsername();

        if (!planta.getUser().getEmail().equals(userEmail)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        planta.setLatitude(localizacao.getLatitude());
        planta.setLongitude(localizacao.getLongitude());
        
        Planta plantaAtualizada = plantaRepository.save(planta);
        return ResponseEntity.ok(plantaAtualizada);
    }
}
