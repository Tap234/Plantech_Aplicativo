package com.example.plantech.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.plantech.entity.Role;
import com.example.plantech.entity.User;
import com.example.plantech.repository.UserRepository;

import java.util.Arrays;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println(">>> Banco de dados vazio. Populando com usuários iniciais...");

            User admin = new User();
            admin.setNome("Admin User");
            admin.setEmail("admin@email.com");
            admin.setSenha(passwordEncoder.encode("senhaadmin"));
            admin.setRole(Role.ROLE_ADMIN);

            User user = new User();
            user.setNome("Common User");
            user.setEmail("user@email.com");
            user.setSenha(passwordEncoder.encode("senha123"));
            user.setRole(Role.ROLE_USER);
            
            userRepository.saveAll(Arrays.asList(admin, user));

            System.out.println(">>> Usuários iniciais criados com sucesso!");
        } else {
            System.out.println(">>> O banco de dados já contém dados. Nenhum usuário foi criado.");
        }
    }
}