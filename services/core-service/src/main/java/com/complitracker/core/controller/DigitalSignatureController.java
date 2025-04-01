package com.complitracker.core.controller;

import com.complitracker.core.model.Document;
import com.complitracker.core.model.SignatureProvider;
import com.complitracker.core.model.SignatureRequest;
import com.complitracker.core.service.DigitalSignatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/core/digital-signature")
@RequiredArgsConstructor
public class DigitalSignatureController {

    private final DigitalSignatureService digitalSignatureService;

    @PostMapping("/create-request")
    public ResponseEntity<SignatureRequest> createSignatureRequest(@RequestBody Document document, @RequestParam List<String> signers, @RequestParam SignatureProvider provider) {
        SignatureRequest request = digitalSignatureService.createSignatureRequest(document, signers, provider);
        return ResponseEntity.ok(request);
    }

    // Additional endpoints can be added here based on service methods
}