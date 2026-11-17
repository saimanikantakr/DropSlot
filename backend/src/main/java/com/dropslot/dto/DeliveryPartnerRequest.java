package com.dropslot.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public record DeliveryPartnerRequest(
    @NotBlank(message = "Partner name is required")
    String name,

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Enter a valid 10-digit mobile number")
    String phone,

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    String email,

    @NotBlank(message = "Vehicle type is required (e.g., Bike, EV Van)")
    String vehicleType,

    @NotBlank(message = "Service zone is required")
    String serviceZone,

    @Positive(message = "Max capacity must be at least 1")
    Integer maxCapacityPerSlot
) {}
