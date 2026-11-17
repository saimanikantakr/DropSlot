package com.dropslot.repository;

import com.dropslot.model.DeliveryPartner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryPartnerRepository extends JpaRepository<DeliveryPartner, Long> {
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    List<DeliveryPartner> findByActiveTrue();
    List<DeliveryPartner> findByServiceZoneIgnoreCase(String serviceZone);
}
