package com.dropslot.service;

import com.dropslot.dto.DeliveryOrderRequest;
import com.dropslot.dto.DeliveryOrderResponse;
import com.dropslot.dto.SlotRequestDto;
import com.dropslot.dto.StatusUpdateDto;
import com.dropslot.exception.ResourceNotFoundException;
import com.dropslot.model.DeliveryOrder;
import com.dropslot.model.DeliveryPartner;
import com.dropslot.model.DeliverySlot;
import com.dropslot.model.DeliveryStatus;
import com.dropslot.repository.DeliveryOrderRepository;
import com.dropslot.repository.DeliveryPartnerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DeliveryOrderService {

    private final DeliveryOrderRepository orderRepository;
    private final DeliveryPartnerRepository partnerRepository;

    public DeliveryOrderService(DeliveryOrderRepository orderRepository,
                                DeliveryPartnerRepository partnerRepository) {
        this.orderRepository = orderRepository;
        this.partnerRepository = partnerRepository;
    }

    @Transactional(readOnly = true)
    public List<DeliveryOrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
            .map(DeliveryOrderResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public DeliveryOrderResponse getOrderById(Long id) {
        return DeliveryOrderResponse.fromEntity(findOrderOrThrow(id));
    }

    @Transactional(readOnly = true)
    public DeliveryOrderResponse getOrderByTracking(String trackingNumber) {
        return orderRepository.findByTrackingNumber(trackingNumber)
            .map(DeliveryOrderResponse::fromEntity)
            .orElseThrow(() -> new ResourceNotFoundException("No consignment found with tracking ID: " + trackingNumber));
    }

    @Transactional(readOnly = true)
    public List<DeliveryOrderResponse> getOrdersByCustomer(String query) {
        String cleanQuery = query.trim();
        List<DeliveryOrder> list;
        if (cleanQuery.contains("@")) {
            list = orderRepository.findByCustomerEmailIgnoreCase(cleanQuery);
        } else {
            list = orderRepository.findByCustomerPhone(cleanQuery);
        }
        return list.stream().map(DeliveryOrderResponse::fromEntity).toList();
    }

    @Transactional(readOnly = true)
    public List<DeliveryOrderResponse> getOrdersByPartner(Long partnerId) {
        return orderRepository.findByAssignedPartnerId(partnerId).stream()
            .map(DeliveryOrderResponse::fromEntity)
            .toList();
    }

    public DeliveryOrderResponse createOrder(DeliveryOrderRequest request) {
        DeliveryOrder order = new DeliveryOrder();

        String tracking = request.trackingNumber();
        if (tracking == null || tracking.isBlank()) {
            tracking = "DS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (orderRepository.existsByTrackingNumber(tracking)) {
            throw new IllegalArgumentException("Tracking number " + tracking + " already exists.");
        }

        order.setTrackingNumber(tracking);
        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone().trim());
        order.setCustomerEmail(request.customerEmail().trim().toLowerCase());
        order.setCustomerAddress(request.customerAddress().trim());
        order.setPackageDescription(request.packageDescription().trim());
        order.setPreferredSlot(request.preferredSlot() != null ? request.preferredSlot() : DeliverySlot.ANYTIME);
        order.setDeliveryDate(request.deliveryDate() != null ? request.deliveryDate() : LocalDate.now());
        order.setDeliveryInstructions(request.deliveryInstructions() != null ? request.deliveryInstructions().trim() : null);
        order.setStatus(DeliveryStatus.ORDER_PLACED);
        order.setAttemptCount(0);

        if (request.assignedPartnerId() != null) {
            DeliveryPartner partner = partnerRepository.findById(request.assignedPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found: " + request.assignedPartnerId()));
            validatePartnerCapacity(partner, order.getPreferredSlot(), order.getDeliveryDate());
            order.setAssignedPartner(partner);
        }

        DeliveryOrder saved = orderRepository.save(order);
        return DeliveryOrderResponse.fromEntity(saved);
    }

    public DeliveryOrderResponse updateOrder(Long id, DeliveryOrderRequest request) {
        DeliveryOrder order = findOrderOrThrow(id);

        order.setCustomerName(request.customerName().trim());
        order.setCustomerPhone(request.customerPhone().trim());
        order.setCustomerEmail(request.customerEmail().trim().toLowerCase());
        order.setCustomerAddress(request.customerAddress().trim());
        order.setPackageDescription(request.packageDescription().trim());
        if (request.preferredSlot() != null) {
            order.setPreferredSlot(request.preferredSlot());
        }
        if (request.deliveryDate() != null) {
            order.setDeliveryDate(request.deliveryDate());
        }
        if (request.deliveryInstructions() != null) {
            order.setDeliveryInstructions(request.deliveryInstructions().trim());
        }

        if (request.assignedPartnerId() != null) {
            DeliveryPartner partner = partnerRepository.findById(request.assignedPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Partner not found: " + request.assignedPartnerId()));
            validatePartnerCapacity(partner, order.getPreferredSlot(), order.getDeliveryDate());
            order.setAssignedPartner(partner);
        } else {
            order.setAssignedPartner(null);
        }

        DeliveryOrder updated = orderRepository.save(order);
        return DeliveryOrderResponse.fromEntity(updated);
    }

    public DeliveryOrderResponse requestSlot(Long id, SlotRequestDto request) {
        DeliveryOrder order = findOrderOrThrow(id);

        if (order.getStatus() == DeliveryStatus.DELIVERED) {
            throw new IllegalStateException("Cannot change slot for an already delivered package.");
        }

        order.setPreferredSlot(request.preferredSlot());
        if (request.deliveryDate() != null) {
            order.setDeliveryDate(request.deliveryDate());
        }
        if (request.deliveryInstructions() != null) {
            order.setDeliveryInstructions(request.deliveryInstructions().trim());
        }
        order.setStatus(DeliveryStatus.SLOT_REQUESTED);

        if (order.getAssignedPartner() != null) {
            validatePartnerCapacity(order.getAssignedPartner(), order.getPreferredSlot(), order.getDeliveryDate());
        }

        DeliveryOrder updated = orderRepository.save(order);
        return DeliveryOrderResponse.fromEntity(updated);
    }

    public DeliveryOrderResponse updateStatus(Long id, StatusUpdateDto request) {
        DeliveryOrder order = findOrderOrThrow(id);
        order.setStatus(request.status());
        if (request.statusNotes() != null) {
            order.setStatusNotes(request.statusNotes().trim());
        }

        if (request.status() == DeliveryStatus.FAILED_ATTEMPT) {
            order.setAttemptCount(order.getAttemptCount() + 1);
        }

        DeliveryOrder updated = orderRepository.save(order);
        return DeliveryOrderResponse.fromEntity(updated);
    }

    public DeliveryOrderResponse assignPartner(Long orderId, Long partnerId) {
        DeliveryOrder order = findOrderOrThrow(orderId);
        DeliveryPartner partner = partnerRepository.findById(partnerId)
            .orElseThrow(() -> new ResourceNotFoundException("Partner not found: " + partnerId));

        validatePartnerCapacity(partner, order.getPreferredSlot(), order.getDeliveryDate());
        order.setAssignedPartner(partner);

        DeliveryOrder updated = orderRepository.save(order);
        return DeliveryOrderResponse.fromEntity(updated);
    }

    public void deleteOrder(Long id) {
        DeliveryOrder order = findOrderOrThrow(id);
        orderRepository.delete(order);
    }

    private void validatePartnerCapacity(DeliveryPartner partner, DeliverySlot slot, LocalDate date) {
        if (!partner.getActive()) {
            throw new IllegalStateException("Delivery partner " + partner.getName() + " is currently marked inactive.");
        }
        long currentBookings = orderRepository.countByAssignedPartnerIdAndPreferredSlotAndDeliveryDate(
            partner.getId(), slot, date
        );
        if (currentBookings >= partner.getMaxCapacityPerSlot()) {
            throw new IllegalStateException(String.format(
                "Partner %s has reached max capacity (%d packages) for slot %s on %s",
                partner.getName(), partner.getMaxCapacityPerSlot(), slot.getDisplayLabel(), date
            ));
        }
    }

    private DeliveryOrder findOrderOrThrow(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Delivery order not found with ID: " + id));
    }
}
