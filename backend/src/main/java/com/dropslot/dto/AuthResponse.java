package com.dropslot.dto;

import com.dropslot.model.Role;
import com.dropslot.model.User;

public record AuthResponse(
    Long id,
    String fullName,
    String email,
    String phone,
    Role role,
    Long partnerId,
    String token,
    String message
) {
    public static AuthResponse fromUser(User user, String token, String message) {
        return new AuthResponse(
            user.getId(),
            user.getFullName(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getPartnerId(),
            token,
            message
        );
    }
}
