package com.dropslot.config;

import com.dropslot.model.DeliveryOrder;
import com.dropslot.model.DeliveryPartner;
import com.dropslot.model.DeliverySlot;
import com.dropslot.model.DeliveryStatus;
import com.dropslot.repository.DeliveryOrderRepository;
import com.dropslot.repository.DeliveryPartnerRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DeliveryPartnerRepository partnerRepository;
    private final DeliveryOrderRepository orderRepository;

    public DataInitializer(DeliveryPartnerRepository partnerRepository,
                           DeliveryOrderRepository orderRepository) {
        this.partnerRepository = partnerRepository;
        this.orderRepository = orderRepository;
    }

    @Override
    public void run(String... args) {
        if (partnerRepository.count() > 0) {
            return;
        }

        // Seed Delivery Partners
        DeliveryPartner rajesh = new DeliveryPartner(null, "Rajesh Sharma", "9876543210", "rajesh.delivery@dropslot.com", "EV Cargo Van", "South Bangalore - Koramangala/HSR", 10, true);
        DeliveryPartner priya = new DeliveryPartner(null, "Priya Nair", "9812345678", "priya.delivery@dropslot.com", "Electric Bike", "East Bangalore - Indiranagar/Whitefield", 8, true);
        DeliveryPartner amit = new DeliveryPartner(null, "Amit Kumar", "9765432109", "amit.delivery@dropslot.com", "Motorcycle", "Hyderabad Central - Madhapur/Hitec City", 8, true);
        DeliveryPartner suresh = new DeliveryPartner(null, "Suresh Reddy", "9945123456", "suresh.delivery@dropslot.com", "EV 3-Wheeler", "Delhi NCR - Saket/Hauz Khas", 12, true);

        partnerRepository.saveAll(List.of(rajesh, priya, amit, suresh));

        LocalDate today = LocalDate.now();

        // Seed Realistic Orders
        DeliveryOrder o1 = new DeliveryOrder();
        o1.setTrackingNumber("DS-BLR-1092");
        o1.setCustomerName("Manikanta Reddy");
        o1.setCustomerPhone("9876501234");
        o1.setCustomerEmail("manikanta@gmail.com");
        o1.setCustomerAddress("Flat 402, Sunshine Heights, 17th Cross, HSR Sector 2, Bangalore - 560102");
        o1.setPackageDescription("Noise ColorFit Pro 5 Smartwatch");
        o1.setPreferredSlot(DeliverySlot.MORNING_09_12);
        o1.setDeliveryDate(today);
        o1.setDeliveryInstructions("Please leave with flat security if I am attending a team standup");
        o1.setStatus(DeliveryStatus.SLOT_REQUESTED);
        o1.setAssignedPartner(rajesh);
        o1.setAttemptCount(0);
        o1.setStatusNotes("Slot preference confirmed by customer");

        DeliveryOrder o2 = new DeliveryOrder();
        o2.setTrackingNumber("DS-BLR-2481");
        o2.setCustomerName("Ananya Deshmukh");
        o2.setCustomerPhone("9823456789");
        o2.setCustomerEmail("ananya.d@outlook.com");
        o2.setCustomerAddress("Villa 12, Green Glen Layout, Bellandur, Bangalore - 560103");
        o2.setPackageDescription("Featherlite Ergonomic High-Back Chair");
        o2.setPreferredSlot(DeliverySlot.AFTERNOON_13_16);
        o2.setDeliveryDate(today);
        o2.setDeliveryInstructions("Lift is operational. Please carry to 3rd floor");
        o2.setStatus(DeliveryStatus.OUT_FOR_DELIVERY);
        o2.setAssignedPartner(priya);
        o2.setAttemptCount(0);
        o2.setStatusNotes("Partner en-route with order consignment");

        DeliveryOrder o3 = new DeliveryOrder();
        o3.setTrackingNumber("DS-HYD-5820");
        o3.setCustomerName("Vikramaditya Varma");
        o3.setCustomerPhone("9988776655");
        o3.setCustomerEmail("vikram.varma@gmail.com");
        o3.setCustomerAddress("Apt 8B, My Home Bhooja, Silpa Gram Craft Village, Hitec City, Hyderabad - 500081");
        o3.setPackageDescription("Keychron K2 Mechanical Keyboard & Palm Rest");
        o3.setPreferredSlot(DeliverySlot.EVENING_17_20);
        o3.setDeliveryDate(today.minusDays(1));
        o3.setDeliveryInstructions("Delivered at doorstep; OTP verified");
        o3.setStatus(DeliveryStatus.DELIVERED);
        o3.setAssignedPartner(amit);
        o3.setAttemptCount(0);
        o3.setStatusNotes("Successfully delivered at 18:42 PM");

        DeliveryOrder o4 = new DeliveryOrder();
        o4.setTrackingNumber("DS-DEL-9143");
        o4.setCustomerName("Rohan Mehra");
        o4.setCustomerPhone("9811223344");
        o4.setCustomerEmail("rohan.m@techcorp.in");
        o4.setCustomerAddress("D-14, Ground Floor, Hauz Khas Enclave, New Delhi - 110016");
        o4.setPackageDescription("Sony WH-1000XM5 Wireless Noise Cancelling Headphones");
        o4.setPreferredSlot(DeliverySlot.ANYTIME);
        o4.setDeliveryDate(today);
        o4.setDeliveryInstructions("Call 10 minutes prior to delivery");
        o4.setStatus(DeliveryStatus.ORDER_PLACED);
        o4.setAssignedPartner(suresh);
        o4.setAttemptCount(0);
        o4.setStatusNotes("Consignment arrived at South Delhi fulfillment hub");

        DeliveryOrder o5 = new DeliveryOrder();
        o5.setTrackingNumber("DS-BLR-7312");
        o5.setCustomerName("Sneha Iyer");
        o5.setCustomerPhone("9741238901");
        o5.setCustomerEmail("sneha.iyer@gmail.com");
        o5.setCustomerAddress("Tower 3, Flat 904, Prestige Shantiniketan, Whitefield, Bangalore - 560066");
        o5.setPackageDescription("Kindle Paperwhite (16 GB) Black");
        o5.setPreferredSlot(DeliverySlot.MORNING_09_12);
        o5.setDeliveryDate(today.minusDays(2));
        o5.setDeliveryInstructions("Ring bell twice");
        o5.setStatus(DeliveryStatus.DELIVERED);
        o5.setAssignedPartner(priya);
        o5.setAttemptCount(0);
        o5.setStatusNotes("Delivered to customer directly");

        DeliveryOrder o6 = new DeliveryOrder();
        o6.setTrackingNumber("DS-HYD-4419");
        o6.setCustomerName("Kavya Rao");
        o6.setCustomerPhone("9632587410");
        o6.setCustomerEmail("kavya.rao@gmail.com");
        o6.setCustomerAddress("Plot 45, Jubilee Hills Checkpost Road 36, Hyderabad - 500033");
        o6.setPackageDescription("Asics Gel-Nimbus 26 Running Shoes");
        o6.setPreferredSlot(DeliverySlot.AFTERNOON_13_16);
        o6.setDeliveryDate(today);
        o6.setDeliveryInstructions("Ring intercom buzzer 45");
        o6.setStatus(DeliveryStatus.FAILED_ATTEMPT);
        o6.setAssignedPartner(amit);
        o6.setAttemptCount(1);
        o6.setStatusNotes("Customer phone unreachable and door locked at 14:15. Will retry next slot.");

        DeliveryOrder o7 = new DeliveryOrder();
        o7.setTrackingNumber("DS-BLR-8834");
        o7.setCustomerName("Manikanta Reddy");
        o7.setCustomerPhone("9876501234");
        o7.setCustomerEmail("manikanta@gmail.com");
        o7.setCustomerAddress("Flat 402, Sunshine Heights, 17th Cross, HSR Sector 2, Bangalore - 560102");
        o7.setPackageDescription("De'Longhi Dedica Espresso Coffee Machine");
        o7.setPreferredSlot(DeliverySlot.EVENING_17_20);
        o7.setDeliveryDate(today.plusDays(1));
        o7.setDeliveryInstructions("Please deliver after 6:30 PM only as I return from office");
        o7.setStatus(DeliveryStatus.SLOT_REQUESTED);
        o7.setAssignedPartner(rajesh);
        o7.setAttemptCount(0);
        o7.setStatusNotes("Customer requested evening dispatch");

        DeliveryOrder o8 = new DeliveryOrder();
        o8.setTrackingNumber("DS-DEL-3301");
        o8.setCustomerName("Tanya Kapoor");
        o8.setCustomerPhone("9955443322");
        o8.setCustomerEmail("tanya.kapoor@gmail.com");
        o8.setCustomerAddress("C-404, DLF Kings Court, Greater Kailash II, New Delhi - 110048");
        o8.setPackageDescription("Wonderchef 5-Piece Ceramic Non-Stick Cookware Set");
        o8.setPreferredSlot(DeliverySlot.AFTERNOON_13_16);
        o8.setDeliveryDate(today);
        o8.setDeliveryInstructions("Fragile glassware inside - handle with extreme care");
        o8.setStatus(DeliveryStatus.OUT_FOR_DELIVERY);
        o8.setAssignedPartner(suresh);
        o8.setAttemptCount(0);
        o8.setStatusNotes("Partner out for delivery in South Delhi sector");

        orderRepository.saveAll(List.of(o1, o2, o3, o4, o5, o6, o7, o8));
    }
}
