import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_STATUSES, DeliveryOrder, DeliveryStatusType, StatusUpdate } from '../../models/delivery.model';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen && order) {
      <div class="ds-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="ds-modal-dialog" (click)="$event.stopPropagation()">
          <div class="ds-card-header">
            <h5 class="ds-card-title">
              <i class="bi bi-arrow-repeat text-primary"></i>
              Update Dispatch Status
            </h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>

          <div class="ds-card-body">
            <div class="p-2 mb-3 rounded bg-light border border-secondary border-opacity-25">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <span class="ds-tracking-chip">{{ order.trackingNumber }}</span>
                <span class="ds-status-pill ds-status-{{ order.status }}">{{ order.statusLabel }}</span>
              </div>
              <div class="small text-muted">{{ order.customerName }} &bull; {{ order.customerAddress }}</div>
            </div>

            <form [formGroup]="statusForm" (ngSubmit)="submit()">
              <!-- Status Radio Group -->
              <div class="mb-3">
                <label class="ds-form-label">New Status</label>
                <div class="list-group">
                  @for (st of statusOptions; track st.key) {
                    <label
                      class="list-group-item list-group-item-action d-flex align-items-center justify-content-between cursor-pointer"
                      [class.active]="statusForm.get('status')?.value === st.key"
                    >
                      <div class="d-flex align-items-center gap-2">
                        <input
                          type="radio"
                          class="form-check-input mt-0"
                          [value]="st.key"
                          formControlName="status"
                        />
                        <i class="bi {{ st.icon }} me-1"></i>
                        <span>{{ st.label }}</span>
                      </div>
                      @if (st.key === 'FAILED_ATTEMPT') {
                        <span class="badge bg-danger bg-opacity-75" style="font-size: 0.7rem;">Will increment attempt #</span>
                      }
                    </label>
                  }
                </div>
              </div>

              <!-- Notes / Reason -->
              <div class="mb-3">
                <label class="ds-form-label">Dispatch Log / Reason Notes</label>
                <textarea
                  class="ds-form-control"
                  rows="2"
                  placeholder="e.g. Handed to customer at door, or door locked - call unanswered"
                  formControlName="statusNotes"
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
                  [disabled]="statusForm.invalid || isSubmitting"
                >
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm"></span> Updating...
                  } @else {
                    <i class="bi bi-save"></i> Save Status Log
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `
})
export class StatusModalComponent {
  @Input() isOpen = false;
  @Input() order: DeliveryOrder | null = null;
  @Output() saveStatus = new EventEmitter<StatusUpdate>();
  @Output() modalClosed = new EventEmitter<void>();

  statusOptions = DELIVERY_STATUSES;
  statusForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.statusForm = this.fb.group({
      status: ['DELIVERED', Validators.required],
      statusNotes: ['']
    });
  }

  ngOnChanges(): void {
    if (this.order) {
      this.statusForm.patchValue({
        status: this.order.status || 'DELIVERED',
        statusNotes: this.order.statusNotes || ''
      });
    }
  }

  submit(): void {
    if (this.statusForm.invalid) return;
    this.isSubmitting = true;
    const req: StatusUpdate = {
      status: this.statusForm.value.status,
      statusNotes: this.statusForm.value.statusNotes
    };
    this.saveStatus.emit(req);
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
