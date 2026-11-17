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
  template: `
    <div class="ds-app-layout">
      <app-header></app-header>

      <div class="ds-main-body">
        <main class="ds-content-area">
          <!-- Operational Ledger Masthead (Clean, No generic KPI stat boxes) -->
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3 pb-3 mb-3 border-bottom border-secondary border-opacity-25">
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-dark text-warning border border-warning border-opacity-50 text-uppercase">
                  Hub Operations
                </span>
                <span class="text-muted small">&bull; Zone: Bangalore / South Dispatch Sector</span>
              </div>
              <h2 class="h4 mb-0 fw-bold" style="font-family: var(--ds-font-serif);">
                Consignment Dispatch & Capacity Ledger
              </h2>
            </div>

            <!-- Quick Action Buttons -->
            <div class="d-flex align-items-center gap-2">
              <button class="ds-btn ds-btn-primary" (click)="openNewOrderModal()">
                <i class="bi bi-plus-lg"></i> Book Consignment
              </button>
              <button class="ds-btn ds-btn-accent" (click)="openNewPartnerModal()">
                <i class="bi bi-person-plus"></i> Register Courier Partner
              </button>
            </div>
          </div>

          <!-- Tab Navigation -->
          <ul class="nav nav-tabs mb-3 border-secondary border-opacity-25">
            <li class="nav-item">
              <button
                class="nav-link py-2 px-3 fw-bold"
                [class.active]="activeTab === 'orders'"
                (click)="setTab('orders')"
              >
                <i class="bi bi-box-seam me-1"></i> Active Consignments ({{ orders.length }})
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link py-2 px-3 fw-bold"
                [class.active]="activeTab === 'fleet'"
                (click)="setTab('fleet')"
              >
                <i class="bi bi-bicycle me-1"></i> Courier Fleet Roster ({{ partners.length }})
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link py-2 px-3 fw-bold"
                [class.active]="activeTab === 'schedule'"
                (click)="setTab('schedule')"
              >
                <i class="bi bi-grid-3x3-gap me-1"></i> Slot Capacity Grid
              </button>
            </li>
          </ul>

          <!-- Flash Message Notification -->
          @if (alertMessage) {
            <div class="alert alert-success alert-dismissible py-2 px-3 mb-3 small d-flex align-items-center justify-content-between">
              <div><i class="bi bi-check-circle-fill me-2"></i>{{ alertMessage }}</div>
              <button type="button" class="btn-close py-2" (click)="alertMessage = ''"></button>
            </div>
          }

          <!-- TAB 1: ORDERS LEDGER -->
          @if (activeTab === 'orders') {
            <div class="ds-card">
              <!-- Filter & Search Toolbar -->
              <div class="ds-card-header flex-wrap gap-2">
                <!-- Search Input -->
                <div class="d-flex align-items-center gap-2 flex-grow-1" style="max-width: 320px;">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white border-end-0">
                      <i class="bi bi-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      class="form-control form-control-sm border-start-0"
                      placeholder="Filter by tracking, consignee, city..."
                      [(ngModel)]="searchQuery"
                      (ngModelChange)="onSearchChange($event)"
                    />
                  </div>
                </div>

                <!-- Status Filter Pills -->
                <div class="d-flex align-items-center gap-1 flex-wrap">
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-2 rounded-pill"
                    [class.btn-dark]="statusFilter === 'ALL'"
                    [class.btn-outline-secondary]="statusFilter !== 'ALL'"
                    (click)="setStatusFilter('ALL')"
                  >
                    All ({{ orders.length }})
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-2 rounded-pill"
                    [class.btn-dark]="statusFilter === 'SLOT_REQUESTED'"
                    [class.btn-outline-secondary]="statusFilter !== 'SLOT_REQUESTED'"
                    (click)="setStatusFilter('SLOT_REQUESTED')"
                  >
                    Slot Requested ({{ countByStatus('SLOT_REQUESTED') }})
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-2 rounded-pill"
                    [class.btn-dark]="statusFilter === 'OUT_FOR_DELIVERY'"
                    [class.btn-outline-secondary]="statusFilter !== 'OUT_FOR_DELIVERY'"
                    (click)="setStatusFilter('OUT_FOR_DELIVERY')"
                  >
                    Out for Delivery ({{ countByStatus('OUT_FOR_DELIVERY') }})
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-2 rounded-pill"
                    [class.btn-dark]="statusFilter === 'DELIVERED'"
                    [class.btn-outline-secondary]="statusFilter !== 'DELIVERED'"
                    (click)="setStatusFilter('DELIVERED')"
                  >
                    Delivered ({{ countByStatus('DELIVERED') }})
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm py-0 px-2 rounded-pill"
                    [class.btn-dark]="statusFilter === 'FAILED_ATTEMPT'"
                    [class.btn-outline-secondary]="statusFilter !== 'FAILED_ATTEMPT'"
                    (click)="setStatusFilter('FAILED_ATTEMPT')"
                  >
                    Failed ({{ countByStatus('FAILED_ATTEMPT') }})
                  </button>
                </div>
              </div>

              <!-- Master Table -->
              <div class="table-responsive">
                <table class="ds-table">
                  <thead>
                    <tr>
                      <th>Consignment ID</th>
                      <th>Consignee</th>
                      <th>Package Item</th>
                      <th>Delivery Slot Window</th>
                      <th>Scheduled Date</th>
                      <th>Assigned Courier</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @if (filteredOrders.length === 0) {
                      <tr>
                        <td colspan="8" class="text-center py-4 text-muted">
                          <i class="bi bi-inbox fs-4 d-block mb-1"></i>
                          No consignments match the current ledger filter.
                        </td>
                      </tr>
                    }
                    @for (order of filteredOrders | paginate: { itemsPerPage: 6, currentPage: currentPage }; track order.id) {
                      <tr>
                        <!-- Tracking # -->
                        <td>
                          <span
                            class="ds-tracking-chip cursor-pointer"
                            (click)="copyTracking(order.trackingNumber)"
                            title="Click to copy Tracking Number"
                          >
                            {{ order.trackingNumber }}
                            <i class="bi bi-copy text-muted" style="font-size: 0.7rem;"></i>
                          </span>
                        </td>

                        <!-- Consignee -->
                        <td>
                          <div class="fw-bold text-dark">{{ order.customerName }}</div>
                          <small class="text-muted d-block" style="font-size: 0.74rem;">
                            {{ order.customerPhone }} &bull; {{ order.customerEmail }}
                          </small>
                          <small class="text-secondary text-truncate d-inline-block" style="max-width: 220px; font-size: 0.74rem;" [title]="order.customerAddress">
                            {{ order.customerAddress }}
                          </small>
                        </td>

                        <!-- Item -->
                        <td>
                          <div class="text-dark fw-semibold">{{ order.packageDescription }}</div>
                          @if (order.deliveryInstructions) {
                            <small class="text-muted fst-italic d-block" style="font-size: 0.73rem;">
                              <i class="bi bi-chat-left-text me-1"></i>"{{ order.deliveryInstructions }}"
                            </small>
                          }
                        </td>

                        <!-- Slot -->
                        <td>
                          <span class="ds-slot-badge">
                            <i class="bi bi-clock"></i>
                            {{ order.preferredSlotLabel || order.preferredSlot }}
                          </span>
                        </td>

                        <!-- Date -->
                        <td>
                          <span class="text-nowrap small text-dark">{{ order.deliveryDate }}</span>
                        </td>

                        <!-- Courier Partner Quick Reassign -->
                        <td>
                          <select
                            class="form-select form-select-sm py-0"
                            style="font-size: 0.78rem; max-width: 170px;"
                            [ngModel]="order.assignedPartnerId"
                            (ngModelChange)="onAssignPartner(order.id, $event)"
                          >
                            <option [ngValue]="null">-- Unassigned --</option>
                            @for (p of partners; track p.id) {
                              <option [ngValue]="p.id">
                                {{ p.name }} ({{ p.vehicleType }})
                              </option>
                            }
                          </select>
                        </td>

                        <!-- Status Pill -->
                        <td>
                          <span class="ds-status-pill ds-status-{{ order.status }}">
                            {{ order.statusLabel }}
                          </span>
                          @if (order.attemptCount > 0) {
                            <small class="text-danger d-block mt-1" style="font-size: 0.7rem;">
                              Attempt #{{ order.attemptCount }}
                            </small>
                          }
                        </td>

                        <!-- Actions -->
                        <td class="text-end">
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-secondary py-0 px-2"
                              (click)="openSlotModal(order)"
                              title="Modify delivery time slot"
                            >
                              <i class="bi bi-calendar2-range"></i> Slot
                            </button>
                            <button
                              class="btn btn-outline-secondary py-0 px-2"
                              (click)="openStatusModal(order)"
                              title="Update delivery status"
                            >
                              <i class="bi bi-arrow-repeat"></i> Status
                            </button>
                            <button
                              class="btn btn-outline-primary py-0 px-2"
                              (click)="openEditOrderModal(order)"
                              title="Edit order details"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger py-0 px-2"
                              (click)="deleteOrder(order.id)"
                              title="Delete consignment"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination Footer -->
              <div class="ds-card-header d-flex justify-content-between align-items-center py-2">
                <small class="text-muted">
                  Showing page {{ currentPage }} of {{ Math.ceil(filteredOrders.length / 6) || 1 }} ({{ filteredOrders.length }} total records)
                </small>
                <pagination-controls
                  (pageChange)="onPageChange($event)"
                  [responsive]="true"
                  previousLabel="Prev"
                  nextLabel="Next"
                ></pagination-controls>
              </div>
            </div>
          }

          <!-- TAB 2: COURIER FLEET ROSTER -->
          @if (activeTab === 'fleet') {
            <div class="ds-card">
              <div class="ds-card-header">
                <h5 class="ds-card-title">
                  <i class="bi bi-bicycle text-primary"></i>
                  Active Delivery Fleet & Vehicle Zone Coverage
                </h5>
                <button class="ds-btn ds-btn-primary ds-btn-sm" (click)="openNewPartnerModal()">
                  <i class="bi bi-plus-lg"></i> Add New Courier Partner
                </button>
              </div>

              <div class="table-responsive">
                <table class="ds-table">
                  <thead>
                    <tr>
                      <th>Partner Name</th>
                      <th>Mobile Number</th>
                      <th>Email ID</th>
                      <th>Vehicle Category</th>
                      <th>Designated Service Zone</th>
                      <th>Max Slot Capacity</th>
                      <th>Current Load</th>
                      <th>Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (partner of partners; track partner.id) {
                      <tr>
                        <td>
                          <div class="fw-bold text-dark">{{ partner.name }}</div>
                        </td>
                        <td>{{ partner.phone }}</td>
                        <td>{{ partner.email }}</td>
                        <td>
                          <span class="badge bg-light text-dark border">
                            <i class="bi bi-truck me-1"></i>{{ partner.vehicleType }}
                          </span>
                        </td>
                        <td>
                          <small class="text-muted">{{ partner.serviceZone }}</small>
                        </td>
                        <td>
                          <span class="badge bg-secondary">{{ partner.maxCapacityPerSlot }} pkgs / slot</span>
                        </td>
                        <td>
                          <span class="fw-bold text-primary">{{ partner.currentLoad }} active</span>
                        </td>
                        <td>
                          @if (partner.active) {
                            <span class="badge bg-success bg-opacity-75">Active</span>
                          } @else {
                            <span class="badge bg-secondary">Inactive</span>
                          }
                        </td>
                        <td class="text-end">
                          <div class="btn-group btn-group-sm">
                            <button
                              class="btn btn-outline-secondary py-0 px-2"
                              (click)="togglePartnerStatus(partner.id)"
                              [title]="partner.active ? 'Deactivate partner' : 'Activate partner'"
                            >
                              <i class="bi" [class.bi-pause-circle]="partner.active" [class.bi-play-circle]="!partner.active"></i>
                            </button>
                            <button
                              class="btn btn-outline-primary py-0 px-2"
                              (click)="openEditPartnerModal(partner)"
                              title="Edit partner profile"
                            >
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button
                              class="btn btn-outline-danger py-0 px-2"
                              (click)="deletePartner(partner.id)"
                              title="Remove partner"
                            >
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 3: SLOT CAPACITY GRID -->
          @if (activeTab === 'schedule') {
            <div class="ds-card">
              <div class="ds-card-header">
                <h5 class="ds-card-title">
                  <i class="bi bi-calendar3 text-warning"></i>
                  Live Courier Time Slot Capacity & Allocation
                </h5>
                <span class="badge bg-light text-dark border">Today's Schedule</span>
              </div>
              <div class="ds-card-body">
                <div class="row g-3">
                  @for (partner of partners; track partner.id) {
                    <div class="col-md-6 col-lg-3">
                      <div class="p-3 border rounded bg-light">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                          <strong class="text-dark">{{ partner.name }}</strong>
                          <span class="badge bg-dark" style="font-size: 0.7rem;">{{ partner.vehicleType }}</span>
                        </div>
                        <div class="small text-muted mb-3">{{ partner.serviceZone }}</div>

                        <!-- Slots Matrix -->
                        <div class="d-flex flex-column gap-2">
                          @for (s of slots; track s.key) {
                            <div class="p-2 border rounded bg-white d-flex align-items-center justify-content-between">
                              <small class="fw-semibold text-dark">{{ s.label }}</small>
                              <span class="badge bg-secondary" style="font-size: 0.7rem;">
                                Limit: {{ partner.maxCapacityPerSlot }} pkgs
                              </span>
                            </div>
                          }
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </main>
      </div>

      <!-- Modals -->
      <app-slot-modal
        [isOpen]="isSlotModalOpen"
        [order]="selectedOrder"
        (saveSlot)="onSaveSlot($event)"
        (modalClosed)="isSlotModalOpen = false"
      ></app-slot-modal>

      <app-status-modal
        [isOpen]="isStatusModalOpen"
        [order]="selectedOrder"
        (saveStatus)="onSaveStatus($event)"
        (modalClosed)="isStatusModalOpen = false"
      ></app-status-modal>

      <app-order-form-modal
        [isOpen]="isOrderModalOpen"
        [isEdit]="isOrderEdit"
        [order]="selectedOrder"
        [partners]="partners"
        (saveOrder)="onSaveOrder($event)"
        (modalClosed)="isOrderModalOpen = false"
      ></app-order-form-modal>

      <app-partner-form-modal
        [isOpen]="isPartnerModalOpen"
        [isEdit]="isPartnerEdit"
        [partner]="selectedPartner"
        (savePartner)="onSavePartner($event)"
        (modalClosed)="isPartnerModalOpen = false"
      ></app-partner-form-modal>
    </div>
  `,
  styles: [`
    .nav-tabs .nav-link {
      color: var(--ds-ink-secondary);
      border: 1px solid transparent;
      cursor: pointer;
    }
    .nav-tabs .nav-link.active {
      color: var(--ds-ink-primary);
      background-color: var(--ds-surface);
      border-color: var(--ds-border) var(--ds-border) transparent;
      border-top: 2px solid var(--ds-primary);
    }
  `]
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

  // Modals state
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

    // Two-way synchronization with the global DeliveryService searchQuery$ (Header search bar)
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

    // Check query params for quick tracking search
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
      // Status filter
      if (this.statusFilter !== 'ALL' && order.status !== this.statusFilter) {
        return false;
      }
      // Text query
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

  // --- Partner Assignment ---
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

  // --- Slot Modal ---
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

  // --- Status Modal ---
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

  // --- Order Form Modal ---
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
            this.orders = [created, ...this.orders];
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

  // --- Partner Form Modal ---
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
            this.partners = [...this.partners, created];
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
