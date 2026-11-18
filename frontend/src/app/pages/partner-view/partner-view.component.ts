import { Component, ChangeDetectorRef, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  DELIVERY_SLOTS,
  DeliveryOrder,
  DeliverySlotType,
  StatusUpdate
} from '../../models/delivery.model';
import { DeliveryService } from '../../services/delivery.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { StatusModalComponent } from '../../components/status-modal/status-modal.component';

@Component({
  selector: 'app-partner-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, StatusModalComponent],
  templateUrl: './partner-view.component.html',
  styleUrls: ['./partner-view.component.css']
})
export class PartnerViewComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  slots = DELIVERY_SLOTS;
  partnerName = 'Rajesh Sharma';
  partnerId = 1;

  orders: DeliveryOrder[] = [];
  slotFilter: string = 'ALL';
  alertMessage = '';

  isStatusModalOpen = false;
  selectedOrder: DeliveryOrder | null = null;

  ngOnInit(): void {
    const session = this.authService.currentSession;
    if (session && session.partnerId) {
      this.partnerId = session.partnerId;
      this.partnerName = session.username;
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.deliveryService.getOrdersByPartner(this.partnerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  setSlotFilter(slot: string): void {
    this.slotFilter = slot;
    this.cdr.detectChanges();
  }

  get filteredOrders(): DeliveryOrder[] {
    if (this.slotFilter === 'ALL') return this.orders;
    return this.orders.filter((o) => o.preferredSlot === this.slotFilter);
  }

  countBySlot(slotKey: DeliverySlotType): number {
    return this.orders.filter((o) => o.preferredSlot === slotKey).length;
  }

  quickStatus(order: DeliveryOrder, status: any, note: string): void {
    this.deliveryService.updateStatus(order.id, { status, statusNotes: note })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.orders = this.orders.map((o) => (o.id === updated.id ? updated : o));
          this.showAlert(`Consignment ${updated.trackingNumber} marked as ${updated.statusLabel}.`);
          this.cdr.detectChanges();
        },
        error: (err) => alert(err.message)
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
        error: (err) => alert(err.message)
      });
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
