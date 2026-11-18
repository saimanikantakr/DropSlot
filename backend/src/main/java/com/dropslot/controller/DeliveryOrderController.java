package com.dropslot.controller;

import com.dropslot.dto.DeliveryOrderRequest;
import com.dropslot.dto.DeliveryOrderResponse;
import com.dropslot.dto.SlotRequestDto;
import com.dropslot.dto.StatusUpdateDto;
import com.dropslot.model.DeliveryStatus;
import com.dropslot.service.DeliveryOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class DeliveryOrderController {

    private final DeliveryOrderService orderService;

    public DeliveryOrderController(DeliveryOrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<DeliveryOrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<DeliveryOrderResponse>> getOrdersPaged(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) DeliveryStatus status,
            @PageableDefault(page = 0, size = 6, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(orderService.searchAndFilterOrdersPaged(query, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryOrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/tracking/{trackingNumber}")
    public ResponseEntity<DeliveryOrderResponse> getOrderByTracking(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(orderService.getOrderByTracking(trackingNumber));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<DeliveryOrderResponse>> getOrdersByCustomer(@RequestParam String query) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(query));
    }

    @GetMapping("/partner/{partnerId}")
    public ResponseEntity<List<DeliveryOrderResponse>> getOrdersByPartner(@PathVariable Long partnerId) {
        return ResponseEntity.ok(orderService.getOrdersByPartner(partnerId));
    }

    @PostMapping
    public ResponseEntity<DeliveryOrderResponse> createOrder(@Valid @RequestBody DeliveryOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeliveryOrderResponse> updateOrder(@PathVariable Long id,
                                                             @Valid @RequestBody DeliveryOrderRequest request) {
        return ResponseEntity.ok(orderService.updateOrder(id, request));
    }

    @PatchMapping("/{id}/slot")
    public ResponseEntity<DeliveryOrderResponse> requestSlot(@PathVariable Long id,
                                                             @Valid @RequestBody SlotRequestDto request) {
        return ResponseEntity.ok(orderService.requestSlot(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DeliveryOrderResponse> updateStatus(@PathVariable Long id,
                                                              @Valid @RequestBody StatusUpdateDto request) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @PatchMapping("/{id}/assign/{partnerId}")
    public ResponseEntity<DeliveryOrderResponse> assignPartner(@PathVariable Long id,
                                                               @PathVariable Long partnerId) {
        return ResponseEntity.ok(orderService.assignPartner(id, partnerId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
