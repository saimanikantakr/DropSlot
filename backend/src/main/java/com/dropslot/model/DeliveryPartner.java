package com.dropslot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "delivery_partners")
public class DeliveryPartner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 50)
    private String vehicleType;

    @Column(nullable = false, length = 100)
    private String serviceZone;

    @Column(nullable = false)
    private Integer maxCapacityPerSlot = 8;

    @Column(nullable = false)
    private Boolean active = true;

    public DeliveryPartner() {}

    public DeliveryPartner(Long id, String name, String phone, String email, String vehicleType, String serviceZone, Integer maxCapacityPerSlot, Boolean active) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.vehicleType = vehicleType;
        this.serviceZone = serviceZone;
        this.maxCapacityPerSlot = maxCapacityPerSlot;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getServiceZone() {
        return serviceZone;
    }

    public void setServiceZone(String serviceZone) {
        this.serviceZone = serviceZone;
    }

    public Integer getMaxCapacityPerSlot() {
        return maxCapacityPerSlot;
    }

    public void setMaxCapacityPerSlot(Integer maxCapacityPerSlot) {
        this.maxCapacityPerSlot = maxCapacityPerSlot;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
