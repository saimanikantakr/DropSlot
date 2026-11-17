export type DeliverySlotType = 'MORNING_09_12' | 'AFTERNOON_13_16' | 'EVENING_17_20' | 'ANYTIME';

export type DeliveryStatusType =
  | 'ORDER_PLACED'
  | 'SLOT_REQUESTED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RESCHEDULED'
  | 'FAILED_ATTEMPT';

export type UserRole = 'admin' | 'partner' | 'customer';

export interface UserSession {
  username: string;
  email: string;
  role: UserRole;
  token: string;
  partnerId?: number;
  customerPhone?: string;
}

export interface DeliveryPartner {
  id: number;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  serviceZone: string;
  maxCapacityPerSlot: number;
  active: boolean;
  currentLoad: number;
}

export interface DeliveryPartnerRequest {
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  serviceZone: string;
  maxCapacityPerSlot: number;
}

export interface DeliveryOrder {
  id: number;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  packageDescription: string;
  preferredSlot: DeliverySlotType;
  preferredSlotLabel: string;
  deliveryDate: string;
  deliveryInstructions?: string;
  status: DeliveryStatusType;
  statusLabel: string;
  assignedPartnerId?: number;
  assignedPartnerName?: string;
  assignedPartnerPhone?: string;
  assignedPartnerVehicle?: string;
  attemptCount: number;
  statusNotes?: string;
}

export interface DeliveryOrderRequest {
  trackingNumber?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  packageDescription: string;
  preferredSlot: DeliverySlotType;
  deliveryDate: string;
  deliveryInstructions?: string;
  assignedPartnerId?: number;
}

export interface SlotRequest {
  preferredSlot: DeliverySlotType;
  deliveryDate?: string;
  deliveryInstructions?: string;
}

export interface StatusUpdate {
  status: DeliveryStatusType;
  statusNotes?: string;
}

export const DELIVERY_SLOTS: { key: DeliverySlotType; label: string; time: string; icon: string }[] = [
  { key: 'MORNING_09_12', label: 'Morning Slot', time: '09:00 AM – 12:00 PM', icon: 'bi-sun' },
  { key: 'AFTERNOON_13_16', label: 'Afternoon Slot', time: '01:00 PM – 04:00 PM', icon: 'bi-brightness-high' },
  { key: 'EVENING_17_20', label: 'Evening Slot', time: '05:00 PM – 08:00 PM', icon: 'bi-moon-stars' },
  { key: 'ANYTIME', label: 'Anytime Slot', time: '08:00 AM – 09:00 PM', icon: 'bi-clock-history' }
];

export const DELIVERY_STATUSES: { key: DeliveryStatusType; label: string; icon: string }[] = [
  { key: 'ORDER_PLACED', label: 'Order Placed', icon: 'bi-box-seam' },
  { key: 'SLOT_REQUESTED', label: 'Slot Requested', icon: 'bi-calendar2-check' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: 'bi-truck' },
  { key: 'DELIVERED', label: 'Delivered', icon: 'bi-check2-circle' },
  { key: 'RESCHEDULED', label: 'Rescheduled', icon: 'bi-arrow-repeat' },
  { key: 'FAILED_ATTEMPT', label: 'Failed Attempt', icon: 'bi-exclamation-octagon' }
];
