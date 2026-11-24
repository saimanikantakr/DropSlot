import { Component, ChangeDetectorRef, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgxPaginationModule } from 'ngx-pagination';

import {
  DELIVERY_SLOTS,
  DeliveryOrder,
  DeliveryOrderRequest,
  DeliveryPartner,
  DeliveryPartnerRequest,
  DeliverySlotType,
  DeliveryStatusType,
  SlotRequest,
  StatusUpdate
} from '../../models/delivery.model';
import { DeliveryService } from '../../services/delivery.service';
import { HeaderComponent } from '../../components/header/header.component';
import { SlotModalComponent } from '../../components/slot-modal/slot-modal.component';
import { StatusModalComponent } from '../../components/status-modal/status-modal.component';
import { OrderFormModalComponent } from '../../components/order-form-modal/order-form-modal.component';
import { PartnerFormModalComponent } from '../../components/partner-form-modal/partner-form-modal.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    HeaderComponent,
    SlotModalComponent,
    StatusModalComponent,
    OrderFormModalComponent,
    PartnerFormModalComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  Math = Math;
  slots = DELIVERY_SLOTS;

  activeTab: 'orders' | 'fleet' | 'schedule' = 'orders';
  orders: DeliveryOrder[] = [];
  partners: DeliveryPartner[] = [];

  searchQuery = '';
  statusFilter: string = 'ALL';
  currentPage = 1;

  alertMessage = '';

  isSlotModalOpen = false;
  isStatusModalOpen = false;
  isOrderModalOpen = false;
  isOrderEdit = false;
  isPartnerModalOpen = false;
  isPartnerEdit = false;

  selectedOrder: DeliveryOrder | null = null;
  selectedPartner: DeliveryPartner | null = null;

  ngOnInit(): void {
    this.loadData();

    this.deliveryService.searchQuery$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (query) => {
          if (this.searchQuery !== query) {
            this.searchQuery = query || '';
            this.currentPage = 1;
            this.cdr.detectChanges();
          }
        }
      });

    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (params) => {
          if (params['track']) {
            this.searchQuery = params['track'];
            this.deliveryService.setSearchQuery(params['track']);
            this.statusFilter = 'ALL';
            this.currentPage = 1;
            this.cdr.detectChanges();
          }
        }
      });
  }

  loadData(): void {
    this.deliveryService.getOrders()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });

    this.deliveryService.getPartners()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.partners = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  setTab(tab: 'orders' | 'fleet' | 'schedule'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  setStatusFilter(filter: string): void {
    this.statusFilter = filter;
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  onSearchChange(newVal?: string): void {
    if (newVal !== undefined) {
      this.deliveryService.setSearchQuery(newVal);
    }
    this.currentPage = 1;
    this.cdr.detectChanges();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.cdr.detectChanges();
  }

  get filteredOrders(): DeliveryOrder[] {
    return this.orders.filter((order) => {
      if (this.statusFilter !== 'ALL' && order.status !== this.statusFilter) {
        return false;
      }
      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim();
        const matchesTracking = order.trackingNumber.toLowerCase().includes(q);
        const matchesName = order.customerName.toLowerCase().includes(q);
        const matchesPhone = order.customerPhone.includes(q);
        const matchesAddress = order.customerAddress.toLowerCase().includes(q);
        const matchesItem = order.packageDescription.toLowerCase().includes(q);
        return matchesTracking || matchesName || matchesPhone || matchesAddress || matchesItem;
      }
      return true;
    });
  }

  countByStatus(status: DeliveryStatusType): number {
    return this.orders.filter((o) => o.status === status).length;
  }

  copyTracking(trackingNumber: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(trackingNumber);
      this.showAlert(`Tracking ID ${trackingNumber} copied to clipboard.`);
    }
  }

  onAssignPartner(orderId: number, partnerId: number | null): void {
    if (!partnerId) return;
    this.deliveryService.assignPartner(orderId, partnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
          this.showAlert(`Consignment assigned to courier partner successfully.`);
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.message || 'Could not assign courier partner.')
      });
  }

  openSlotModal(order: DeliveryOrder): void {
    this.selectedOrder = order;
    this.isSlotModalOpen = true;
    this.cdr.detectChanges();
  }

  onSaveSlot(req: SlotRequest): void {
    if (!this.selectedOrder) return;
    this.deliveryService.requestSlot(this.selectedOrder.id, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
          this.showAlert(`Time slot updated for ${updated.trackingNumber}.`);
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.message || 'Slot update failed.')
      });
  }

  openStatusModal(order: DeliveryOrder): void {
    this.selectedOrder = order;
    this.isStatusModalOpen = true;
    this.cdr.detectChanges();
  }

  onSaveStatus(req: StatusUpdate): void {
    if (!this.selectedOrder) return;
    this.deliveryService.updateStatus(this.selectedOrder.id, req)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
          this.showAlert(`Status for ${updated.trackingNumber} updated to ${updated.statusLabel}.`);
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.message || 'Status update failed.')
      });
  }

  openNewOrderModal(): void {
    this.selectedOrder = null;
    this.isOrderEdit = false;
    this.isOrderModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditOrderModal(order: DeliveryOrder): void {
    this.selectedOrder = order;
    this.isOrderEdit = true;
    this.isOrderModalOpen = true;
    this.cdr.detectChanges();
  }

  onSaveOrder(req: DeliveryOrderRequest): void {
    if (this.isOrderEdit && this.selectedOrder) {
      this.deliveryService.updateOrder(this.selectedOrder.id, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
            this.showAlert(`Consignment ${updated.trackingNumber} updated.`);
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    } else {
      this.deliveryService.createOrder(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created) => {
            this.showAlert(`New consignment ${created.trackingNumber} booked.`);
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    }
  }

  deleteOrder(id: number): void {
    if (confirm('Are you sure you want to delete this dispatch consignment?')) {
      this.deliveryService.deleteOrder(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.orders = this.orders.filter((o) => o.id !== id);
            this.showAlert('Consignment deleted from dispatch ledger.');
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    }
  }

  openNewPartnerModal(): void {
    this.selectedPartner = null;
    this.isPartnerEdit = false;
    this.isPartnerModalOpen = true;
    this.cdr.detectChanges();
  }

  openEditPartnerModal(partner: DeliveryPartner): void {
    this.selectedPartner = partner;
    this.isPartnerEdit = true;
    this.isPartnerModalOpen = true;
    this.cdr.detectChanges();
  }

  onSavePartner(req: DeliveryPartnerRequest): void {
    if (this.isPartnerEdit && this.selectedPartner) {
      this.deliveryService.updatePartner(this.selectedPartner.id, req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (updated) => {
            this.partners = this.partners.map((p) => (p.id === updated.id ? updated : p));
            this.showAlert(`Courier partner ${updated.name} updated.`);
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    } else {
      this.deliveryService.createPartner(req)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created) => {
            this.showAlert(`New courier partner ${created.name} registered.`);
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    }
  }

  togglePartnerStatus(id: number): void {
    this.deliveryService.togglePartnerStatus(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.partners = this.partners.map((p) => (p.id === updated.id ? updated : p));
          this.showAlert(`Partner ${updated.name} status updated.`);
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.message)
      });
  }

  deletePartner(id: number): void {
    if (confirm('Are you sure you want to remove this courier partner?')) {
      this.deliveryService.deletePartner(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.partners = this.partners.filter((p) => p.id !== id);
            this.showAlert('Courier partner removed from roster.');
            this.cdr.detectChanges();
          },
          error: (err) => alert(err.message)
        });
    }
  }

  private showAlert(msg: string): void {
    this.alertMessage = msg;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.alertMessage = '';
      this.cdr.detectChanges();
    }, 4500);
  }
}
