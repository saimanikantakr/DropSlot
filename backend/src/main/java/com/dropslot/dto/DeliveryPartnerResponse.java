package com.dropslot.dto;

import com.dropslot.model.DeliveryPartner;

public record DeliveryPartnerResponse(
    Long id,
    String name,
    String phone,
    String email,
    String vehicleType,
    String serviceZone,
    Integer maxCapacityPerSlot,
    Boolean active,
    long currentLoad
) {
    public static DeliveryPartnerResponse fromEntity(DeliveryPartner partner, long currentLoad) {
        return new DeliveryPartnerResponse(
            partner.getId(),
            partner.getName(),
            partner.getPhone(),
            partner.getEmail(),
            partner.getVehicleType(),
            partner.getServiceZone(),
            partner.getMaxCapacityPerSlot(),
            partner.getActive(),
            currentLoad
        );
    }
}
