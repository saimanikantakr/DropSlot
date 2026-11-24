import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import {
  DeliveryOrder,
  DeliveryOrderRequest,
  DeliveryPartner,
  DeliveryPartnerRequest,
  DeliverySlotType,
  SlotRequest,
  StatusUpdate
} from '../models/delivery.model';

const ORDERS_STORAGE_KEY = 'dropslot_orders_store';
const PARTNERS_STORAGE_KEY = 'dropslot_partners_store';

@Injectable({
  providedIn: 'root'
})
export class DeliveryService {
  private readonly baseUrl = 'http://localhost:8088/api';

  private ordersSubject: BehaviorSubject<DeliveryOrder[]>;
  private partnersSubject: BehaviorSubject<DeliveryPartner[]>;

  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$: Observable<string> = this.searchQuerySubject.asObservable();

  constructor(private http: HttpClient) {
    this.ordersSubject = new BehaviorSubject<DeliveryOrder[]>(this.loadInitialOrders());
    this.partnersSubject = new BehaviorSubject<DeliveryPartner[]>(this.loadInitialPartners());
    this.syncFromBackend();
  }

  public setSearchQuery(q: string): void {
    this.searchQuerySubject.next(q || '');
  }

  public get currentSearchQuery(): string {
    return this.searchQuerySubject.value;
  }

  public getOrders(): Observable<DeliveryOrder[]> {
    return this.ordersSubject.asObservable();
  }

  public getOrderById(id: number): Observable<DeliveryOrder> {
    const found = this.ordersSubject.value.find(o => o.id === id);
    if (found) return of(found);
    return of(this.ordersSubject.value[0]);
  }

  public getOrderByTracking(trackingNumber: string): Observable<DeliveryOrder> {
    const found = this.ordersSubject.value.find(
      o => o.trackingNumber.toLowerCase() === trackingNumber.trim().toLowerCase()
    );
    if (found) return of(found);
    return of(this.ordersSubject.value[0]);
  }

  public getOrdersByCustomer(query: string): Observable<DeliveryOrder[]> {
    const clean = query.trim().toLowerCase();
    const list = this.ordersSubject.value.filter(
      o => o.customerPhone.includes(clean) || o.customerEmail.toLowerCase().includes(clean)
    );
    return of(list.length > 0 ? list : this.ordersSubject.value.slice(0, 3));
  }

  public getOrdersByPartner(partnerId: number): Observable<DeliveryOrder[]> {
    const list = this.ordersSubject.value.filter(o => o.assignedPartnerId === partnerId);
    return of(list);
  }

  public createOrder(req: DeliveryOrderRequest): Observable<DeliveryOrder> {
    const current = this.ordersSubject.value;
    const newId = current.length > 0 ? Math.max(...current.map(o => o.id)) + 1 : 101;
    const tracking = req.trackingNumber || `DS-BLR-${Math.floor(1000 + Math.random() * 9000)}`;

    const partner = req.assignedPartnerId
      ? this.partnersSubject.value.find(p => p.id === req.assignedPartnerId)
      : null;

    const newOrder: DeliveryOrder = {
      id: newId,
      trackingNumber: tracking,
      customerName: req.customerName,
      customerPhone: req.customerPhone,
      customerEmail: req.customerEmail,
      customerAddress: req.customerAddress,
      packageDescription: req.packageDescription,
      preferredSlot: req.preferredSlot,
      preferredSlotLabel: this.getSlotLabel(req.preferredSlot),
      deliveryDate: req.deliveryDate,
      deliveryInstructions: req.deliveryInstructions,
      status: 'ORDER_PLACED',
      statusLabel: 'Order Placed',
      assignedPartnerId: partner ? partner.id : undefined,
      assignedPartnerName: partner ? partner.name : undefined,
      assignedPartnerPhone: partner ? partner.phone : undefined,
      assignedPartnerVehicle: partner ? partner.vehicleType : undefined,
      attemptCount: 0,
      statusNotes: 'Order registered in dispatch hub'
    };

    const updated = [newOrder, ...current];
    this.updateOrdersState(updated);

    this.http.post<DeliveryOrder>(`${this.baseUrl}/orders`, req).pipe(catchError(() => of(newOrder))).subscribe();

    return of(newOrder);
  }

  public updateOrder(id: number, req: DeliveryOrderRequest): Observable<DeliveryOrder> {
    const current = this.ordersSubject.value;
    const partner = req.assignedPartnerId
      ? this.partnersSubject.value.find(p => p.id === req.assignedPartnerId)
      : null;

    let target: DeliveryOrder | null = null;
    const updated = current.map(o => {
      if (o.id === id) {
        target = {
          ...o,
          customerName: req.customerName,
          customerPhone: req.customerPhone,
          customerEmail: req.customerEmail,
          customerAddress: req.customerAddress,
          packageDescription: req.packageDescription,
          preferredSlot: req.preferredSlot,
          preferredSlotLabel: this.getSlotLabel(req.preferredSlot),
          deliveryDate: req.deliveryDate,
          deliveryInstructions: req.deliveryInstructions,
          assignedPartnerId: partner ? partner.id : undefined,
          assignedPartnerName: partner ? partner.name : undefined,
          assignedPartnerPhone: partner ? partner.phone : undefined,
          assignedPartnerVehicle: partner ? partner.vehicleType : undefined
        };
        return target;
      }
      return o;
    });

    this.updateOrdersState(updated);
    this.http.put<DeliveryOrder>(`${this.baseUrl}/orders/${id}`, req).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public requestSlot(id: number, req: SlotRequest): Observable<DeliveryOrder> {
    const current = this.ordersSubject.value;
    let target: DeliveryOrder | null = null;
    const updated = current.map(o => {
      if (o.id === id) {
        target = {
          ...o,
          preferredSlot: req.preferredSlot,
          preferredSlotLabel: this.getSlotLabel(req.preferredSlot),
          deliveryDate: req.deliveryDate || o.deliveryDate,
          deliveryInstructions: req.deliveryInstructions || o.deliveryInstructions,
          status: 'SLOT_REQUESTED',
          statusLabel: 'Slot Requested',
          statusNotes: `Customer updated slot to ${this.getSlotLabel(req.preferredSlot)}`
        };
        return target;
      }
      return o;
    });

    this.updateOrdersState(updated);
    this.http.patch<DeliveryOrder>(`${this.baseUrl}/orders/${id}/slot`, req).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public updateStatus(id: number, req: StatusUpdate): Observable<DeliveryOrder> {
    const current = this.ordersSubject.value;
    let target: DeliveryOrder | null = null;
    const updated = current.map(o => {
      if (o.id === id) {
        const attempt = req.status === 'FAILED_ATTEMPT' ? o.attemptCount + 1 : o.attemptCount;
        target = {
          ...o,
          status: req.status,
          statusLabel: this.getStatusLabel(req.status),
          statusNotes: req.statusNotes || o.statusNotes,
          attemptCount: attempt
        };
        return target;
      }
      return o;
    });

    this.updateOrdersState(updated);
    this.http.patch<DeliveryOrder>(`${this.baseUrl}/orders/${id}/status`, req).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public assignPartner(orderId: number, partnerId: number): Observable<DeliveryOrder> {
    const current = this.ordersSubject.value;
    const partner = this.partnersSubject.value.find(p => p.id === partnerId);
    let target: DeliveryOrder | null = null;

    const updated = current.map(o => {
      if (o.id === orderId && partner) {
        target = {
          ...o,
          assignedPartnerId: partner.id,
          assignedPartnerName: partner.name,
          assignedPartnerPhone: partner.phone,
          assignedPartnerVehicle: partner.vehicleType,
          statusNotes: `Assigned to courier ${partner.name}`
        };
        return target;
      }
      return o;
    });

    this.updateOrdersState(updated);
    this.http.patch<DeliveryOrder>(`${this.baseUrl}/orders/${orderId}/assign/${partnerId}`, {}).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public deleteOrder(id: number): Observable<void> {
    const updated = this.ordersSubject.value.filter(o => o.id !== id);
    this.updateOrdersState(updated);
    this.http.delete<void>(`${this.baseUrl}/orders/${id}`).pipe(catchError(() => of(undefined))).subscribe();
    return of(undefined);
  }

  public getPartners(): Observable<DeliveryPartner[]> {
    return this.partnersSubject.asObservable();
  }

  public createPartner(req: DeliveryPartnerRequest): Observable<DeliveryPartner> {
    const current = this.partnersSubject.value;
    const newId = current.length > 0 ? Math.max(...current.map(p => p.id)) + 1 : 1;
    const newPartner: DeliveryPartner = {
      id: newId,
      name: req.name,
      phone: req.phone,
      email: req.email,
      vehicleType: req.vehicleType,
      serviceZone: req.serviceZone,
      maxCapacityPerSlot: req.maxCapacityPerSlot || 8,
      active: true,
      currentLoad: 0
    };

    const updated = [...current, newPartner];
    this.updatePartnersState(updated);
    this.http.post<DeliveryPartner>(`${this.baseUrl}/partners`, req).pipe(catchError(() => of(newPartner))).subscribe();
    return of(newPartner);
  }

  public updatePartner(id: number, req: DeliveryPartnerRequest): Observable<DeliveryPartner> {
    const current = this.partnersSubject.value;
    let target: DeliveryPartner | null = null;
    const updated = current.map(p => {
      if (p.id === id) {
        target = {
          ...p,
          name: req.name,
          phone: req.phone,
          email: req.email,
          vehicleType: req.vehicleType,
          serviceZone: req.serviceZone,
          maxCapacityPerSlot: req.maxCapacityPerSlot || p.maxCapacityPerSlot
        };
        return target;
      }
      return p;
    });

    this.updatePartnersState(updated);
    this.http.put<DeliveryPartner>(`${this.baseUrl}/partners/${id}`, req).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public togglePartnerStatus(id: number): Observable<DeliveryPartner> {
    const current = this.partnersSubject.value;
    let target: DeliveryPartner | null = null;
    const updated = current.map(p => {
      if (p.id === id) {
        target = { ...p, active: !p.active };
        return target;
      }
      return p;
    });

    this.updatePartnersState(updated);
    this.http.patch<DeliveryPartner>(`${this.baseUrl}/partners/${id}/toggle-status`, {}).pipe(catchError(() => of(target!))).subscribe();
    return of(target || current[0]);
  }

  public deletePartner(id: number): Observable<void> {
    const updated = this.partnersSubject.value.filter(p => p.id !== id);
    this.updatePartnersState(updated);
    this.http.delete<void>(`${this.baseUrl}/partners/${id}`).pipe(catchError(() => of(undefined))).subscribe();
    return of(undefined);
  }

  private deduplicateOrders(orders: DeliveryOrder[]): DeliveryOrder[] {
    const seenTracking = new Set<string>();
    const seenIds = new Set<number>();
    return orders.filter(o => {
      if (!o) return false;
      const tracking = (o.trackingNumber || '').trim().toLowerCase();
      if (tracking && seenTracking.has(tracking)) return false;
      if (o.id && seenIds.has(o.id)) return false;
      if (tracking) seenTracking.add(tracking);
      if (o.id) seenIds.add(o.id);
      return true;
    });
  }

  private deduplicatePartners(partners: DeliveryPartner[]): DeliveryPartner[] {
    const seen = new Set<number>();
    return partners.filter(p => {
      if (!p || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }

  private updateOrdersState(orders: DeliveryOrder[]): void {
    const uniqueOrders = this.deduplicateOrders(orders);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(uniqueOrders));
    }
    this.ordersSubject.next(uniqueOrders);
  }

  private updatePartnersState(partners: DeliveryPartner[]): void {
    const uniquePartners = this.deduplicatePartners(partners);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(PARTNERS_STORAGE_KEY, JSON.stringify(uniquePartners));
    }
    this.partnersSubject.next(uniquePartners);
  }

  private loadInitialOrders(): DeliveryOrder[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return this.deduplicateOrders(parsed);
        } catch (e) {}
      }
    }
    return this.getSeedOrders();
  }

  private loadInitialPartners(): DeliveryPartner[] {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem(PARTNERS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return this.deduplicatePartners(parsed);
        } catch (e) {}
      }
    }
    return this.getSeedPartners();
  }

  private syncFromBackend(): void {
    this.http.get<DeliveryOrder[]>(`${this.baseUrl}/orders`).pipe(
      catchError(() => of(null))
    ).subscribe(orders => {
      if (orders && orders.length > 0) {
        this.updateOrdersState(orders);
      }
    });

    this.http.get<DeliveryPartner[]>(`${this.baseUrl}/partners`).pipe(
      catchError(() => of(null))
    ).subscribe(partners => {
      if (partners && partners.length > 0) {
        this.updatePartnersState(partners);
      }
    });
  }

  private getSlotLabel(slot: DeliverySlotType): string {
    switch (slot) {
      case 'MORNING_09_12': return 'Morning (09:00 AM - 12:00 PM)';
      case 'AFTERNOON_13_16': return 'Afternoon (01:00 PM - 04:00 PM)';
      case 'EVENING_17_20': return 'Evening (05:00 PM - 08:00 PM)';
      default: return 'Anytime (08:00 AM - 09:00 PM)';
    }
  }

  private getStatusLabel(status: any): string {
    switch (status) {
      case 'ORDER_PLACED': return 'Order Placed';
      case 'SLOT_REQUESTED': return 'Slot Requested';
      case 'OUT_FOR_DELIVERY': return 'Out for Delivery';
      case 'DELIVERED': return 'Delivered';
      case 'RESCHEDULED': return 'Rescheduled';
      case 'FAILED_ATTEMPT': return 'Failed Attempt';
      default: return status;
    }
  }

  private getSeedPartners(): DeliveryPartner[] {
    return [
      { id: 1, name: 'Rajesh Sharma', phone: '9876543210', email: 'rajesh.delivery@dropslot.com', vehicleType: 'EV Cargo Van', serviceZone: 'South Bangalore - Koramangala/HSR', maxCapacityPerSlot: 10, active: true, currentLoad: 2 },
      { id: 2, name: 'Priya Nair', phone: '9812345678', email: 'priya.delivery@dropslot.com', vehicleType: 'Electric Bike', serviceZone: 'East Bangalore - Indiranagar/Whitefield', maxCapacityPerSlot: 8, active: true, currentLoad: 2 },
      { id: 3, name: 'Amit Kumar', phone: '9765432109', email: 'amit.delivery@dropslot.com', vehicleType: 'Motorcycle', serviceZone: 'Hyderabad Central - Madhapur/Hitec City', maxCapacityPerSlot: 8, active: true, currentLoad: 2 },
      { id: 4, name: 'Suresh Reddy', phone: '9945123456', email: 'suresh.delivery@dropslot.com', vehicleType: 'EV 3-Wheeler', serviceZone: 'Delhi NCR - Saket/Hauz Khas', maxCapacityPerSlot: 12, active: true, currentLoad: 2 }
    ];
  }

  private getSeedOrders(): DeliveryOrder[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1,
        trackingNumber: 'DS-BLR-1092',
        customerName: 'Manikanta Reddy',
        customerPhone: '9876501234',
        customerEmail: 'manikanta@gmail.com',
        customerAddress: 'Flat 402, Sunshine Heights, 17th Cross, HSR Sector 2, Bangalore - 560102',
        packageDescription: 'Noise ColorFit Pro 5 Smartwatch',
        preferredSlot: 'MORNING_09_12',
        preferredSlotLabel: 'Morning (09:00 AM - 12:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Please leave with flat security if I am attending a team standup',
        status: 'SLOT_REQUESTED',
        statusLabel: 'Slot Requested',
        assignedPartnerId: 1,
        assignedPartnerName: 'Rajesh Sharma',
        assignedPartnerPhone: '9876543210',
        assignedPartnerVehicle: 'EV Cargo Van',
        attemptCount: 0,
        statusNotes: 'Customer requested 9 AM - 12 PM slot'
      },
      {
        id: 2,
        trackingNumber: 'DS-BLR-2481',
        customerName: 'Ananya Deshmukh',
        customerPhone: '9823456789',
        customerEmail: 'ananya.d@outlook.com',
        customerAddress: 'Villa 12, Green Glen Layout, Bellandur, Bangalore - 560103',
        packageDescription: 'Featherlite Ergonomic High-Back Chair',
        preferredSlot: 'AFTERNOON_13_16',
        preferredSlotLabel: 'Afternoon (01:00 PM - 04:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Lift is operational. Please carry to 3rd floor',
        status: 'OUT_FOR_DELIVERY',
        statusLabel: 'Out for Delivery',
        assignedPartnerId: 2,
        assignedPartnerName: 'Priya Nair',
        assignedPartnerPhone: '9812345678',
        assignedPartnerVehicle: 'Electric Bike',
        attemptCount: 0,
        statusNotes: 'Partner en-route with order consignment'
      },
      {
        id: 3,
        trackingNumber: 'DS-HYD-5820',
        customerName: 'Vikramaditya Varma',
        customerPhone: '9988776655',
        customerEmail: 'vikram.varma@gmail.com',
        customerAddress: 'Apt 8B, My Home Bhooja, Silpa Gram Craft Village, Hitec City, Hyderabad - 500081',
        packageDescription: 'Keychron K2 Mechanical Keyboard & Palm Rest',
        preferredSlot: 'EVENING_17_20',
        preferredSlotLabel: 'Evening (05:00 PM - 08:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Delivered at doorstep; OTP verified',
        status: 'DELIVERED',
        statusLabel: 'Delivered',
        assignedPartnerId: 3,
        assignedPartnerName: 'Amit Kumar',
        assignedPartnerPhone: '9765432109',
        assignedPartnerVehicle: 'Motorcycle',
        attemptCount: 0,
        statusNotes: 'Successfully delivered at 18:42 PM'
      },
      {
        id: 4,
        trackingNumber: 'DS-DEL-9143',
        customerName: 'Rohan Mehra',
        customerPhone: '9811223344',
        customerEmail: 'rohan.m@techcorp.in',
        customerAddress: 'D-14, Ground Floor, Hauz Khas Enclave, New Delhi - 110016',
        packageDescription: 'Sony WH-1000XM5 Wireless Headphones',
        preferredSlot: 'ANYTIME',
        preferredSlotLabel: 'Anytime (08:00 AM - 09:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Call 10 minutes prior to delivery',
        status: 'ORDER_PLACED',
        statusLabel: 'Order Placed',
        assignedPartnerId: 4,
        assignedPartnerName: 'Suresh Reddy',
        assignedPartnerPhone: '9945123456',
        assignedPartnerVehicle: 'EV 3-Wheeler',
        attemptCount: 0,
        statusNotes: 'Consignment arrived at South Delhi fulfillment hub'
      },
      {
        id: 5,
        trackingNumber: 'DS-BLR-7312',
        customerName: 'Sneha Iyer',
        customerPhone: '9741238901',
        customerEmail: 'sneha.iyer@gmail.com',
        customerAddress: 'Tower 3, Flat 904, Prestige Shantiniketan, Whitefield, Bangalore - 560066',
        packageDescription: 'Kindle Paperwhite (16 GB) Black',
        preferredSlot: 'MORNING_09_12',
        preferredSlotLabel: 'Morning (09:00 AM - 12:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Ring bell twice',
        status: 'DELIVERED',
        statusLabel: 'Delivered',
        assignedPartnerId: 2,
        assignedPartnerName: 'Priya Nair',
        assignedPartnerPhone: '9812345678',
        assignedPartnerVehicle: 'Electric Bike',
        attemptCount: 0,
        statusNotes: 'Delivered to customer directly'
      },
      {
        id: 6,
        trackingNumber: 'DS-HYD-4419',
        customerName: 'Kavya Rao',
        customerPhone: '9632587410',
        customerEmail: 'kavya.rao@gmail.com',
        customerAddress: 'Plot 45, Jubilee Hills Checkpost Road 36, Hyderabad - 500033',
        packageDescription: 'Asics Gel-Nimbus 26 Running Shoes',
        preferredSlot: 'AFTERNOON_13_16',
        preferredSlotLabel: 'Afternoon (01:00 PM - 04:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Ring intercom buzzer 45',
        status: 'FAILED_ATTEMPT',
        statusLabel: 'Failed Attempt',
        assignedPartnerId: 3,
        assignedPartnerName: 'Amit Kumar',
        assignedPartnerPhone: '9765432109',
        assignedPartnerVehicle: 'Motorcycle',
        attemptCount: 1,
        statusNotes: 'Customer phone unreachable; door locked'
      },
      {
        id: 7,
        trackingNumber: 'DS-BLR-8834',
        customerName: 'Manikanta Reddy',
        customerPhone: '9876501234',
        customerEmail: 'manikanta@gmail.com',
        customerAddress: 'Flat 402, Sunshine Heights, 17th Cross, HSR Sector 2, Bangalore - 560102',
        packageDescription: "De'Longhi Dedica Espresso Coffee Machine",
        preferredSlot: 'EVENING_17_20',
        preferredSlotLabel: 'Evening (05:00 PM - 08:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Please deliver after 6:30 PM only as I return from office',
        status: 'SLOT_REQUESTED',
        statusLabel: 'Slot Requested',
        assignedPartnerId: 1,
        assignedPartnerName: 'Rajesh Sharma',
        assignedPartnerPhone: '9876543210',
        assignedPartnerVehicle: 'EV Cargo Van',
        attemptCount: 0,
        statusNotes: 'Customer requested evening slot'
      },
      {
        id: 8,
        trackingNumber: 'DS-DEL-3301',
        customerName: 'Tanya Kapoor',
        customerPhone: '9955443322',
        customerEmail: 'tanya.kapoor@gmail.com',
        customerAddress: 'C-404, DLF Kings Court, Greater Kailash II, New Delhi - 110048',
        packageDescription: 'Wonderchef 5-Piece Ceramic Non-Stick Cookware Set',
        preferredSlot: 'AFTERNOON_13_16',
        preferredSlotLabel: 'Afternoon (01:00 PM - 04:00 PM)',
        deliveryDate: today,
        deliveryInstructions: 'Fragile glassware inside - handle with extreme care',
        status: 'OUT_FOR_DELIVERY',
        statusLabel: 'Out for Delivery',
        assignedPartnerId: 4,
        assignedPartnerName: 'Suresh Reddy',
        assignedPartnerPhone: '9945123456',
        assignedPartnerVehicle: 'EV 3-Wheeler',
        attemptCount: 0,
        statusNotes: 'Partner out for delivery in South Delhi sector'
      }
    ];
  }
}
