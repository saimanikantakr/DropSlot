package com.dropslot.dto;

import com.dropslot.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignUpRequest(
    @NotBlank(message = "Full name is required")
    String fullName,

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email is required")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    String password,

    String phone,

    @NotNull(message = "Role is required (ROLE_ADMIN, ROLE_PARTNER, ROLE_CUSTOMER)")
    Role role,

    // Optional partner details if registering as partner
    String vehicleType,
    String serviceZone
) {}
