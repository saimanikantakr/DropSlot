package com.dropslot.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "delivery_orders")
public class DeliveryOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String trackingNumber;

    @Column(nullable = false, length = 100)
    private String customerName;

    @Column(nullable = false, length = 20)
    private String customerPhone;

    @Column(nullable = false, length = 100)
    private String customerEmail;

    @Column(nullable = false, length = 255)
    private String customerAddress;

    @Column(nullable = false, length = 150)
    private String packageDescription;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeliverySlot preferredSlot = DeliverySlot.ANYTIME;

    @Column(nullable = false)
    private LocalDate deliveryDate = LocalDate.now();

    @Column(length = 255)
    private String deliveryInstructions;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DeliveryStatus status = DeliveryStatus.ORDER_PLACED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_partner_id")
    private DeliveryPartner assignedPartner;

    @Column(nullable = false)
    private Integer attemptCount = 0;

    @Column(length = 255)
    private String statusNotes;

    public DeliveryOrder() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerAddress() {
        return customerAddress;
    }

    public void setCustomerAddress(String customerAddress) {
        this.customerAddress = customerAddress;
    }

    public String getPackageDescription() {
        return packageDescription;
    }

    public void setPackageDescription(String packageDescription) {
        this.packageDescription = packageDescription;
    }

    public DeliverySlot getPreferredSlot() {
        return preferredSlot;
    }

    public void setPreferredSlot(DeliverySlot preferredSlot) {
        this.preferredSlot = preferredSlot;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getDeliveryInstructions() {
        return deliveryInstructions;
    }

    public void setDeliveryInstructions(String deliveryInstructions) {
        this.deliveryInstructions = deliveryInstructions;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(DeliveryStatus status) {
        this.status = status;
    }

    public DeliveryPartner getAssignedPartner() {
        return assignedPartner;
    }

    public void setAssignedPartner(DeliveryPartner assignedPartner) {
        this.assignedPartner = assignedPartner;
    }

    public Integer getAttemptCount() {
        return attemptCount;
    }

    public void setAttemptCount(Integer attemptCount) {
        this.attemptCount = attemptCount;
    }

    public String getStatusNotes() {
        return statusNotes;
    }

    public void setStatusNotes(String statusNotes) {
        this.statusNotes = statusNotes;
    }
}
