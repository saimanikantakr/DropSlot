package com.dropslot.repository;

import com.dropslot.model.DeliveryOrder;
import com.dropslot.model.DeliverySlot;
import com.dropslot.model.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryOrderRepository extends JpaRepository<DeliveryOrder, Long> {
    Optional<DeliveryOrder> findByTrackingNumber(String trackingNumber);
    boolean existsByTrackingNumber(String trackingNumber);
    List<DeliveryOrder> findByCustomerPhone(String customerPhone);
    List<DeliveryOrder> findByCustomerEmailIgnoreCase(String customerEmail);
    List<DeliveryOrder> findByAssignedPartnerId(Long partnerId);
    List<DeliveryOrder> findByStatus(DeliveryStatus status);
    List<DeliveryOrder> findByDeliveryDate(LocalDate deliveryDate);
    long countByAssignedPartnerIdAndPreferredSlotAndDeliveryDate(Long partnerId, DeliverySlot slot, LocalDate deliveryDate);
}
