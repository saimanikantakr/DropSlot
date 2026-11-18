package com.dropslot.repository;

import com.dropslot.model.DeliveryOrder;
import com.dropslot.model.DeliverySlot;
import com.dropslot.model.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    // ================= SERVER-SIDE & QUERY-SIDE PAGINATION =================

    // 1. Pagination with Status filter
    Page<DeliveryOrder> findByStatus(DeliveryStatus status, Pageable pageable);

    // 2. Query-side filtering with full-text search across multiple fields + status filter + pagination
    @Query("""
        SELECT o FROM DeliveryOrder o
        WHERE (:status IS NULL OR o.status = :status)
          AND (:query IS NULL OR :query = '' OR
               LOWER(o.trackingNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(o.customerName) LIKE LOWER(CONCAT('%', :query, '%')) OR
               o.customerPhone LIKE CONCAT('%', :query, '%') OR
               LOWER(o.customerAddress) LIKE LOWER(CONCAT('%', :query, '%')) OR
               LOWER(o.packageDescription) LIKE LOWER(CONCAT('%', :query, '%')))
    """)
    Page<DeliveryOrder> searchAndFilterOrders(
        @Param("query") String query,
        @Param("status") DeliveryStatus status,
        Pageable pageable
    );
}
