package com.dropslot.controller;

import com.dropslot.dto.DeliveryPartnerRequest;
import com.dropslot.dto.DeliveryPartnerResponse;
import com.dropslot.service.DeliveryPartnerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/partners")
@CrossOrigin(origins = "*")
public class DeliveryPartnerController {

    private final DeliveryPartnerService partnerService;

    public DeliveryPartnerController(DeliveryPartnerService partnerService) {
        this.partnerService = partnerService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryPartnerResponse>> getAllPartners() {
        return ResponseEntity.ok(partnerService.getAllPartners());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryPartnerResponse> getPartnerById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.getPartnerById(id));
    }

    @PostMapping
    public ResponseEntity<DeliveryPartnerResponse> createPartner(@Valid @RequestBody DeliveryPartnerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerService.createPartner(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryPartnerResponse> updatePartner(@PathVariable Long id,
                                                                 @Valid @RequestBody DeliveryPartnerRequest request) {
        return ResponseEntity.ok(partnerService.updatePartner(id, request));
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<DeliveryPartnerResponse> toggleStatus(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.toggleStatus(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePartner(@PathVariable Long id) {
        partnerService.deletePartner(id);
        return ResponseEntity.noContent().build();
    }
}
