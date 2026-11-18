package com.dropslot.service;

import com.dropslot.dto.AuthResponse;
import com.dropslot.dto.LoginRequest;
import com.dropslot.dto.SignUpRequest;
import com.dropslot.exception.ResourceNotFoundException;
import com.dropslot.model.DeliveryPartner;
import com.dropslot.model.Role;
import com.dropslot.model.User;
import com.dropslot.repository.DeliveryPartnerRepository;
import com.dropslot.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final DeliveryPartnerRepository partnerRepository;

    public AuthService(UserRepository userRepository,
                       DeliveryPartnerRepository partnerRepository) {
        this.userRepository = userRepository;
        this.partnerRepository = partnerRepository;
    }

    public AuthResponse register(SignUpRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new IllegalArgumentException("Account with email " + normalizedEmail + " already exists.");
        }

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(hashPassword(request.password()));
        user.setPhone(request.phone() != null ? request.phone().trim() : null);
        user.setRole(request.role());
        user.setEnabled(true);

        if (request.role() == Role.ROLE_PARTNER) {
            DeliveryPartner partner = new DeliveryPartner();
            partner.setName(request.fullName().trim());
            partner.setEmail(normalizedEmail);
            partner.setPhone(request.phone() != null ? request.phone().trim() : "9876500000");
            partner.setVehicleType(request.vehicleType() != null ? request.vehicleType() : "Electric Bike");
            partner.setServiceZone(request.serviceZone() != null ? request.serviceZone() : "City Wide Hub");
            partner.setMaxCapacityPerSlot(8);
            partner.setActive(true);
            DeliveryPartner savedPartner = partnerRepository.save(partner);
            user.setPartnerId(savedPartner.getId());
        }

        User savedUser = userRepository.save(user);
        String token = generateToken(savedUser);
        return AuthResponse.fromUser(savedUser, token, "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
            .orElseThrow(() -> new ResourceNotFoundException("Invalid credentials. No user found with email: " + normalizedEmail));

        String hashedInput = hashPassword(request.password());
        if (!hashedInput.equals(user.getPassword())) {
            throw new IllegalArgumentException("Invalid password. Please check your credentials.");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String token = generateToken(user);
        return AuthResponse.fromUser(user, token, "Login successful");
    }

    @Transactional(readOnly = true)
    public User getCurrentUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    public static String hashPassword(String password) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(("DS_SALT_" + password).getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String generateToken(User user) {
        return "DS_TOKEN_" + user.getRole().name() + "_" + UUID.randomUUID().toString().replace("-", "") + "_" + user.getId();
    }
}
