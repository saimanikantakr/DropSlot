package com.dropslot.dto;

import com.dropslot.model.DeliverySlot;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record DeliveryOrderRequest(
    String trackingNumber,

    @NotBlank(message = "Customer name is required")
    String customerName,

    @NotBlank(message = "Customer phone number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Enter a valid 10-digit mobile number")
    String customerPhone,

    @NotBlank(message = "Customer email is required")
    @Email(message = "Enter a valid email address")
    String customerEmail,

    @NotBlank(message = "Delivery address is required")
    String customerAddress,

    @NotBlank(message = "Package description is required")
    String packageDescription,

    DeliverySlot preferredSlot,

    LocalDate deliveryDate,

    String deliveryInstructions,

    Long assignedPartnerId
) {}
