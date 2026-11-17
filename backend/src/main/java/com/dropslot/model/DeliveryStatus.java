package com.dropslot.model;

public enum DeliveryStatus {
    ORDER_PLACED("Order Placed"),
    SLOT_REQUESTED("Slot Requested"),
    OUT_FOR_DELIVERY("Out for Delivery"),
    DELIVERED("Delivered"),
    RESCHEDULED("Rescheduled"),
    FAILED_ATTEMPT("Failed Attempt");

    private final String displayLabel;

    DeliveryStatus(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }
}
