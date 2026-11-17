package com.dropslot.service;

import com.dropslot.dto.DeliveryPartnerRequest;
import com.dropslot.dto.DeliveryPartnerResponse;
import com.dropslot.exception.ResourceNotFoundException;
import com.dropslot.model.DeliveryPartner;
import com.dropslot.model.DeliveryStatus;
import com.dropslot.repository.DeliveryOrderRepository;
import com.dropslot.repository.DeliveryPartnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class DeliveryPartnerService {

    private final DeliveryPartnerRepository partnerRepository;
    private final DeliveryOrderRepository orderRepository;

    public DeliveryPartnerService(DeliveryPartnerRepository partnerRepository,
                                  DeliveryOrderRepository orderRepository) {
        this.partnerRepository = partnerRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryPartnerResponse> getAllPartners() {
        LocalDate today = LocalDate.now();
        return partnerRepository.findAll().stream()
            .map(partner -> {
                long activeOrders = orderRepository.findByAssignedPartnerId(partner.getId()).stream()
                    .filter(o -> o.getStatus() != DeliveryStatus.DELIVERED)
                    .count();
                return DeliveryPartnerResponse.fromEntity(partner, activeOrders);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public DeliveryPartnerResponse getPartnerById(Long id) {
        DeliveryPartner partner = findPartnerOrThrow(id);
        long activeOrders = orderRepository.findByAssignedPartnerId(partner.getId()).stream()
            .filter(o -> o.getStatus() != DeliveryStatus.DELIVERED)
            .count();
        return DeliveryPartnerResponse.fromEntity(partner, activeOrders);
    }

    public DeliveryPartnerResponse createPartner(DeliveryPartnerRequest request) {
        if (partnerRepository.existsByPhone(request.phone())) {
            throw new IllegalArgumentException("Phone number " + request.phone() + " is already registered.");
        }
        if (partnerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email " + request.email() + " is already registered.");
        }

        DeliveryPartner partner = new DeliveryPartner();
        partner.setName(request.name().trim());
        partner.setPhone(request.phone().trim());
        partner.setEmail(request.email().trim().toLowerCase());
        partner.setVehicleType(request.vehicleType().trim());
        partner.setServiceZone(request.serviceZone().trim());
        partner.setMaxCapacityPerSlot(request.maxCapacityPerSlot() != null ? request.maxCapacityPerSlot() : 8);
        partner.setActive(true);

        DeliveryPartner saved = partnerRepository.save(partner);
        return DeliveryPartnerResponse.fromEntity(saved, 0);
    }

    public DeliveryPartnerResponse updatePartner(Long id, DeliveryPartnerRequest request) {
        DeliveryPartner partner = findPartnerOrThrow(id);

        if (!partner.getPhone().equals(request.phone()) && partnerRepository.existsByPhone(request.phone())) {
            throw new IllegalArgumentException("Phone number " + request.phone() + " is already registered.");
        }
        if (!partner.getEmail().equalsIgnoreCase(request.email()) && partnerRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email " + request.email() + " is already registered.");
        }

        partner.setName(request.name().trim());
        partner.setPhone(request.phone().trim());
        partner.setEmail(request.email().trim().toLowerCase());
        partner.setVehicleType(request.vehicleType().trim());
        partner.setServiceZone(request.serviceZone().trim());
        if (request.maxCapacityPerSlot() != null) {
            partner.setMaxCapacityPerSlot(request.maxCapacityPerSlot());
        }

        DeliveryPartner updated = partnerRepository.save(partner);
        long activeOrders = orderRepository.findByAssignedPartnerId(updated.getId()).stream()
            .filter(o -> o.getStatus() != DeliveryStatus.DELIVERED)
            .count();
        return DeliveryPartnerResponse.fromEntity(updated, activeOrders);
    }

    public DeliveryPartnerResponse toggleStatus(Long id) {
        DeliveryPartner partner = findPartnerOrThrow(id);
        partner.setActive(!partner.getActive());
        DeliveryPartner updated = partnerRepository.save(partner);
        long activeOrders = orderRepository.findByAssignedPartnerId(updated.getId()).stream()
            .filter(o -> o.getStatus() != DeliveryStatus.DELIVERED)
            .count();
        return DeliveryPartnerResponse.fromEntity(updated, activeOrders);
    }

    public void deletePartner(Long id) {
        DeliveryPartner partner = findPartnerOrThrow(id);
        partnerRepository.delete(partner);
    }

    public DeliveryPartner findPartnerOrThrow(Long id) {
        return partnerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Delivery partner not found with ID: " + id));
    }
}
