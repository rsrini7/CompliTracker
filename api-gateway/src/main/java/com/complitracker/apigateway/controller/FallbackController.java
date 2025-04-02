package com.complitracker.apigateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping("/auth")
    public ResponseEntity<String> authFallback() {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Auth Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/document")
    public ResponseEntity<String> documentFallback() {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Document Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/email")
    public ResponseEntity<String> emailFallback() {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Email Service is currently unavailable. Please try again later.");
    }

    @GetMapping("/core")
    public ResponseEntity<String> coreFallback() {
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Core Service is currently unavailable. Please try again later.");
    }
}