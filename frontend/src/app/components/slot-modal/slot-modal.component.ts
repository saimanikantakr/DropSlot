import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_SLOTS, DeliveryOrder, DeliverySlotType, SlotRequest } from '../../models/delivery.model';

@Component({
  selector: 'app-slot-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen && order) {
      <div class="ds-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="ds-modal-dialog" (click)="$event.stopPropagation()">
          <div class="ds-card-header">
            <h5 class="ds-card-title">
              <i class="bi bi-calendar2-check text-warning"></i>
              Select Delivery Window
            </h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>

          <div class="ds-card-body">
            <!-- Consignment Summary -->
            <div class="p-2 mb-3 rounded bg-light border border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
              <div>
                <span class="ds-tracking-chip">{{ order.trackingNumber }}</span>
                <span class="fw-bold ms-2 text-dark">{{ order.packageDescription }}</span>
              </div>
              <span class="badge bg-secondary">{{ order.customerName }}</span>
            </div>

            <form [formGroup]="slotForm" (ngSubmit)="submit()">
              <!-- Slots Option Cards -->
              <div class="mb-3">
                <label class="ds-form-label">Available Time Windows</label>
                <div class="row g-2">
                  @for (slot of slots; track slot.key) {
                    <div class="col-6">
                      <div
                        class="p-2 border rounded cursor-pointer transition slot-card"
                        [class.slot-selected]="slotForm.get('preferredSlot')?.value === slot.key"
                        (click)="selectSlot(slot.key)"
                      >
                        <div class="d-flex align-items-center justify-content-between">
                          <strong class="small text-dark">{{ slot.label }}</strong>
                          <i class="bi {{ slot.icon }} text-muted"></i>
                        </div>
                        <div class="text-muted" style="font-size: 0.75rem;">{{ slot.time }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Date Picker -->
              <div class="mb-3">
                <label class="ds-form-label">Preferred Date</label>
                <input type="date" class="ds-form-control" formControlName="deliveryDate" />
              </div>

              <!-- Gate & Doorstep Instructions -->
              <div class="mb-3">
                <label class="ds-form-label">Delivery & Gate Instructions</label>
                <textarea
                  class="ds-form-control"
                  rows="2"
                  placeholder="e.g. Leave with building security guard, or call before buzzer"
                  formControlName="deliveryInstructions"
                ></textarea>
              </div>

              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
                <button type="button" class="ds-btn ds-btn-outline" (click)="close()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="ds-btn ds-btn-primary"
                  [disabled]="slotForm.invalid || isSubmitting"
                >
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm"></span> Saving...
                  } @else {
                    <i class="bi bi-check-lg"></i> Confirm Time Slot
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .slot-card {
      background: #faf8f5;
      border-color: var(--ds-border) !important;
      cursor: pointer;
      user-select: none;
    }
    .slot-card:hover {
      background: var(--ds-surface-hover);
    }
    .slot-selected {
      background: #fdf3e7 !important;
      border-color: #c9883b !important;
      box-shadow: 0 0 0 2px rgba(201, 136, 59, 0.25);
    }
  `]
})
export class SlotModalComponent {
  @Input() isOpen = false;
  @Input() order: DeliveryOrder | null = null;
  @Output() saveSlot = new EventEmitter<SlotRequest>();
  @Output() modalClosed = new EventEmitter<void>();

  slots = DELIVERY_SLOTS;
  slotForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.slotForm = this.fb.group({
      preferredSlot: ['MORNING_09_12', Validators.required],
      deliveryDate: [new Date().toISOString().split('T')[0], Validators.required],
      deliveryInstructions: ['']
    });
  }

  ngOnChanges(): void {
    if (this.order) {
      this.slotForm.patchValue({
        preferredSlot: this.order.preferredSlot || 'MORNING_09_12',
        deliveryDate: this.order.deliveryDate || new Date().toISOString().split('T')[0],
        deliveryInstructions: this.order.deliveryInstructions || ''
      });
    }
  }

  selectSlot(slotKey: DeliverySlotType): void {
    this.slotForm.patchValue({ preferredSlot: slotKey });
  }

  submit(): void {
    if (this.slotForm.invalid) return;
    this.isSubmitting = true;
    const req: SlotRequest = {
      preferredSlot: this.slotForm.value.preferredSlot,
      deliveryDate: this.slotForm.value.deliveryDate,
      deliveryInstructions: this.slotForm.value.deliveryInstructions
    };
    this.saveSlot.emit(req);
    this.isSubmitting = false;
    this.close();
  }

  close(): void {
    this.modalClosed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ds-modal-backdrop')) {
      this.close();
    }
  }
}
