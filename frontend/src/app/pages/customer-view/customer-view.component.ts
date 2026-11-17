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
  template: `
    <div class="ds-app-layout">
      <app-header></app-header>

      <div class="ds-main-body">
        <main class="ds-content-area" style="max-width: 960px; margin: 0 auto;">
          <!-- Masthead -->
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 mb-4 border-bottom border-secondary border-opacity-25">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-warning text-dark text-uppercase">Consignee Self-Service</span>
                <span class="text-muted small">&bull; DropSlot Concierge</span>
              </div>
              <h2 class="h4 mb-0 fw-bold" style="font-family: var(--ds-font-serif);">
                Welcome, {{ customerName }}
              </h2>
            </div>
            <div>
              <span class="text-muted small">Registered Phone:</span>
              <strong class="ms-1 text-dark">{{ customerPhone }}</strong>
            </div>
          </div>

          <!-- Alert -->
          @if (alertMessage) {
            <div class="alert alert-success alert-dismissible py-2 px-3 mb-3 small d-flex align-items-center justify-content-between">
              <div><i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}</div>
              <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
            </div>
          }

          <!-- Empty State -->
          @if (orders.length === 0) {
            <div class="ds-card text-center py-5">
              <i class="bi bi-box-seam fs-1 text-muted d-block mb-2"></i>
              <h5 class="fw-bold">No Consignments Linked to {{ customerPhone }}</h5>
              <p class="text-muted small">When an e-commerce merchant dispatches an order for you, it will appear here.</p>
            </div>
          }

          <!-- Packages List -->
          <div class="d-flex flex-column gap-4">
            @for (order of orders; track order.id) {
              <div class="ds-card">
                <!-- Header -->
                <div class="ds-card-header d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="ds-tracking-chip">{{ order.trackingNumber }}</span>
                    <span class="text-muted small">&bull; Scheduled: {{ order.deliveryDate }}</span>
                  </div>
                  <div>
                    <span class="ds-status-pill ds-status-{{ order.status }}">{{ order.statusLabel }}</span>
                  </div>
                </div>

                <div class="ds-card-body">
                  <div class="row g-4">
                    <!-- Package Info -->
                    <div class="col-md-7">
                      <h4 class="h5 fw-bold text-dark mb-2">
                        <i class="bi bi-box2 text-primary me-2"></i>{{ order.packageDescription }}
                      </h4>

                      <div class="small text-muted mb-2">
                        <i class="bi bi-geo-alt me-1 text-danger"></i>
                        {{ order.customerAddress }}
                      </div>

                      @if (order.assignedPartnerName) {
                        <div class="p-2 mb-3 rounded bg-light border d-flex align-items-center justify-content-between">
                          <div>
                            <small class="text-muted d-block" style="font-size: 0.72rem;">Assigned Delivery Partner</small>
                            <strong class="text-dark">{{ order.assignedPartnerName }}</strong>
                            <small class="text-muted ms-1">({{ order.assignedPartnerVehicle }})</small>
                          </div>
                          @if (order.assignedPartnerPhone) {
                            <a href="tel:{{ order.assignedPartnerPhone }}" class="btn btn-sm btn-outline-secondary py-0 px-2">
                              <i class="bi bi-telephone me-1"></i> Contact Partner
                            </a>
                          }
                        </div>
                      }

                      <!-- Stepper Timeline -->
                      <div class="mt-4">
                        <h6 class="small fw-bold text-uppercase text-muted mb-3">Live Dispatch Progress</h6>
                        <div class="d-flex align-items-center justify-content-between position-relative px-2">
                          <!-- Line -->
                          <div class="position-absolute start-0 end-0 bg-secondary bg-opacity-25" style="height: 2px; top: 12px; z-index: 1;"></div>
                          
                          <!-- Step 1: Placed -->
                          <div class="position-relative text-center" style="z-index: 2;">
                            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 text-white bg-success" style="width: 26px; height: 26px; font-size: 0.75rem;">
                              <i class="bi bi-check"></i>
                            </div>
                            <span class="small text-muted" style="font-size: 0.7rem;">Order Placed</span>
                          </div>

                          <!-- Step 2: Slot Chosen -->
                          <div class="position-relative text-center" style="z-index: 2;">
                            <div
                              class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 text-white"
                              [class.bg-success]="order.status !== 'ORDER_PLACED'"
                              [class.bg-secondary]="order.status === 'ORDER_PLACED'"
                              style="width: 26px; height: 26px; font-size: 0.75rem;"
                            >
                              <i class="bi bi-calendar-check"></i>
                            </div>
                            <span class="small text-muted" style="font-size: 0.7rem;">Slot Confirmed</span>
                          </div>

                          <!-- Step 3: Out for Delivery -->
                          <div class="position-relative text-center" style="z-index: 2;">
                            <div
                              class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 text-white"
                              [class.bg-success]="order.status === 'OUT_FOR_DELIVERY' || order.status === 'DELIVERED'"
                              [class.bg-secondary]="order.status !== 'OUT_FOR_DELIVERY' && order.status !== 'DELIVERED'"
                              style="width: 26px; height: 26px; font-size: 0.75rem;"
                            >
                              <i class="bi bi-truck"></i>
                            </div>
                            <span class="small text-muted" style="font-size: 0.7rem;">Out for Delivery</span>
                          </div>

                          <!-- Step 4: Delivered -->
                          <div class="position-relative text-center" style="z-index: 2;">
                            <div
                              class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 text-white"
                              [class.bg-success]="order.status === 'DELIVERED'"
                              [class.bg-secondary]="order.status !== 'DELIVERED'"
                              style="width: 26px; height: 26px; font-size: 0.75rem;"
                            >
                              <i class="bi bi-house-check"></i>
                            </div>
                            <span class="small text-muted" style="font-size: 0.7rem;">Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Slot Self-Selection Card -->
                    <div class="col-md-5 border-start ps-md-4">
                      <div class="p-3 rounded bg-light border border-secondary border-opacity-25 h-100 d-flex flex-column justify-content-between">
                        <div>
                          <div class="d-flex align-items-center justify-content-between mb-2">
                            <span class="fw-bold small text-uppercase text-dark">Selected Delivery Window</span>
                            <span class="badge bg-warning text-dark">Active Preference</span>
                          </div>

                          <div class="p-2 mb-3 rounded bg-white border d-flex align-items-center gap-2">
                            <i class="bi bi-clock-history fs-4 text-warning"></i>
                            <div>
                              <strong class="d-block text-dark">{{ order.preferredSlotLabel || order.preferredSlot }}</strong>
                              <small class="text-muted">Window: {{ getSlotTime(order.preferredSlot) }}</small>
                            </div>
                          </div>

                          <div class="mb-3">
                            <label class="ds-form-label">Gate & Doorstep Instructions:</label>
                            @if (order.deliveryInstructions) {
                              <div class="p-2 bg-white rounded border small text-secondary fst-italic">
                                "{{ order.deliveryInstructions }}"
                              </div>
                            } @else {
                              <div class="small text-muted fst-italic">
                                No instructions added yet. Click below to add.
                              </div>
                            }
                          </div>
                        </div>

                        <!-- Slot Action -->
                        <div>
                          @if (order.status !== 'DELIVERED') {
                            <button
                              class="ds-btn ds-btn-primary w-100 justify-content-center py-2"
                              (click)="openSlotModal(order)"
                            >
                              <i class="bi bi-pencil-square"></i> Change Delivery Slot & Instructions
                            </button>
                            <small class="text-muted d-block text-center mt-1" style="font-size: 0.72rem;">
                              Free rescheduling anytime prior to dispatch
                            </small>
                          } @else {
                            <div class="text-center text-success fw-bold py-2">
                              <i class="bi bi-check2-circle me-1"></i> Delivery Completed
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        </main>
      </div>

      <!-- Slot Modal -->
      <app-slot-modal
        [isOpen]="isSlotModalOpen"
        [order]="selectedOrder"
        (saveSlot)="onSaveSlot($event)"
        (modalClosed)="isSlotModalOpen = false"
      ></app-slot-modal>
    </div>
  `
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
    return found ? found.time : 'Scheduled Delivery';
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
          this.showAlert(`Your delivery preference for ${updated.trackingNumber} has been updated.`);
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
