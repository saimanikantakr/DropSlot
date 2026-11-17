package com.dropslot.dto;

import com.dropslot.model.DeliverySlot;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SlotRequestDto(
    @NotNull(message = "Preferred slot is required")
    DeliverySlot preferredSlot,

    LocalDate deliveryDate,

    String deliveryInstructions
) {}
