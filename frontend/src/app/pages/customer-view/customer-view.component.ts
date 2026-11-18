import { Component, ChangeDetectorRef, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  DELIVERY_SLOTS,
  DeliveryOrder,
  SlotRequest
} from '../../models/delivery.model';
import { DeliveryService } from '../../services/delivery.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { SlotModalComponent } from '../../components/slot-modal/slot-modal.component';

@Component({
  selector: 'app-customer-view',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, SlotModalComponent],
  templateUrl: './customer-view.component.html',
  styleUrls: ['./customer-view.component.css']
})
export class CustomerViewComponent implements OnInit {
  private deliveryService = inject(DeliveryService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  customerName = 'Manikanta Reddy';
  customerPhone = '9876501234';

  orders: DeliveryOrder[] = [];
  alertMessage = '';

  isSlotModalOpen = false;
  selectedOrder: DeliveryOrder | null = null;

  ngOnInit(): void {
    const session = this.authService.currentSession;
    if (session) {
      this.customerName = session.username;
      if (session.customerPhone) {
        this.customerPhone = session.customerPhone;
      }
    }
    this.loadOrders();
  }

  loadOrders(): void {
    this.deliveryService.getOrdersByCustomer(this.customerPhone)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.orders = res || [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
  }

  getSlotTime(slotKey: string): string {
    const found = DELIVERY_SLOTS.find((s) => s.key === slotKey);
    return found ? found.time : 'Anytime Window';
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
          this.showAlert(`Delivery window updated to ${updated.preferredSlotLabel || updated.preferredSlot}.`);
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
