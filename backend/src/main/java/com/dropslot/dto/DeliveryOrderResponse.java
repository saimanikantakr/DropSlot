package com.dropslot.dto;

import com.dropslot.model.DeliveryOrder;
import com.dropslot.model.DeliverySlot;
import com.dropslot.model.DeliveryStatus;

import java.time.LocalDate;

public record DeliveryOrderResponse(
    Long id,
    String trackingNumber,
    String customerName,
    String customerPhone,
    String customerEmail,
    String customerAddress,
    String packageDescription,
    DeliverySlot preferredSlot,
    String preferredSlotLabel,
    LocalDate deliveryDate,
    String deliveryInstructions,
    DeliveryStatus status,
    String statusLabel,
    Long assignedPartnerId,
    String assignedPartnerName,
    String assignedPartnerPhone,
    String assignedPartnerVehicle,
    Integer attemptCount,
    String statusNotes
) {
    public static DeliveryOrderResponse fromEntity(DeliveryOrder order) {
        Long partnerId = null;
        String partnerName = null;
        String partnerPhone = null;
        String partnerVehicle = null;

        if (order.getAssignedPartner() != null) {
            partnerId = order.getAssignedPartner().getId();
            partnerName = order.getAssignedPartner().getName();
            partnerPhone = order.getAssignedPartner().getPhone();
            partnerVehicle = order.getAssignedPartner().getVehicleType();
        }

        return new DeliveryOrderResponse(
            order.getId(),
            order.getTrackingNumber(),
            order.getCustomerName(),
            order.getCustomerPhone(),
            order.getCustomerEmail(),
            order.getCustomerAddress(),
            order.getPackageDescription(),
            order.getPreferredSlot(),
            order.getPreferredSlot() != null ? order.getPreferredSlot().getDisplayLabel() : null,
            order.getDeliveryDate(),
            order.getDeliveryInstructions(),
            order.getStatus(),
            order.getStatus() != null ? order.getStatus().getDisplayLabel() : null,
            partnerId,
            partnerName,
            partnerPhone,
            partnerVehicle,
            order.getAttemptCount(),
            order.getStatusNotes()
        );
    }
}
