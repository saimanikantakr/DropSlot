package com.dropslot.model;

public enum DeliverySlot {
    MORNING_09_12("Morning (09:00 AM - 12:00 PM)"),
    AFTERNOON_13_16("Afternoon (01:00 PM - 04:00 PM)"),
    EVENING_17_20("Evening (05:00 PM - 08:00 PM)"),
    ANYTIME("Anytime (08:00 AM - 09:00 PM)");

    private final String displayLabel;

    DeliverySlot(String displayLabel) {
        this.displayLabel = displayLabel;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }
}
