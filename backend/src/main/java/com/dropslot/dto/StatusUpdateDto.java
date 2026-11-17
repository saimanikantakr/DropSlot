package com.dropslot.dto;

import com.dropslot.model.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateDto(
    @NotNull(message = "Delivery status is required")
    DeliveryStatus status,

    String statusNotes
) {}
