package com.complitracker.authservice.config;

import com.complitracker.authservice.model.ERole;
import com.complitracker.authservice.model.Role;
import com.complitracker.authservice.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        // Initialize roles if they don't exist
        Arrays.stream(ERole.values()).forEach(role -> {
            if (!roleRepository.findByName(role).isPresent()) {
                roleRepository.save(new Role(role));
            }
        });
    }
}