import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_SLOTS, DeliveryOrder, DeliveryOrderRequest, DeliveryPartner } from '../../models/delivery.model';

@Component({
  selector: 'app-order-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="ds-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="ds-modal-dialog" style="max-width: 650px;" (click)="$event.stopPropagation()">
          <div class="ds-card-header">
            <h5 class="ds-card-title">
              <i class="bi bi-box-seam text-warning"></i>
              {{ isEdit ? 'Edit Dispatch Consignment' : 'Book New Consignment' }}
            </h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>

          <div class="ds-card-body">
            <form [formGroup]="orderForm" (ngSubmit)="submit()">
              <div class="row g-3">
                <!-- Package Description -->
                <div class="col-12">
                  <label class="ds-form-label">Package / Product Description *</label>
                  <input
                    type="text"
                    class="ds-form-control"
                    placeholder="e.g. Wireless Ergonomic Headphones"
                    formControlName="packageDescription"
                  />
                  @if (orderForm.get('packageDescription')?.touched && orderForm.get('packageDescription')?.invalid) {
                    <small class="text-danger">Package description is required.</small>
                  }
                </div>

                <!-- Customer Name & Phone -->
                <div class="col-md-6">
                  <label class="ds-form-label">Customer Full Name *</label>
                  <input
                    type="text"
                    class="ds-form-control"
                    placeholder="e.g. Manikanta Reddy"
                    formControlName="customerName"
                  />
                  @if (orderForm.get('customerName')?.touched && orderForm.get('customerName')?.invalid) {
                    <small class="text-danger">Customer name is required.</small>
                  }
                </div>

                <div class="col-md-6">
                  <label class="ds-form-label">Customer Mobile (Exactly 10 Digits) *</label>
                  <input
                    type="text"
                    inputmode="numeric"
                    class="ds-form-control"
                    placeholder="e.g. 9876501234"
                    formControlName="customerPhone"
                    maxlength="10"
                    (input)="onPhoneInput($event)"
                    (keypress)="onlyNumbers($event)"
                    (paste)="onPhonePaste($event)"
                  />
                  @if (orderForm.get('customerPhone')?.touched && orderForm.get('customerPhone')?.invalid) {
                    <small class="text-danger">
                      @if (orderForm.get('customerPhone')?.errors?.['required']) {
                        Customer mobile is required.
                      } @else if (orderForm.get('customerPhone')?.errors?.['pattern'] || orderForm.get('customerPhone')?.errors?.['maxlength'] || orderForm.get('customerPhone')?.errors?.['minlength']) {
                        Must be exactly 10 digits starting with 6, 7, 8, or 9.
                      }
                    </small>
                  }
                </div>

                <!-- Email & Slot -->
                <div class="col-md-6">
                  <label class="ds-form-label">Customer Email *</label>
                  <input
                    type="email"
                    class="ds-form-control"
                    placeholder="e.g. customer@domain.com"
                    formControlName="customerEmail"
                  />
                  @if (orderForm.get('customerEmail')?.touched && orderForm.get('customerEmail')?.invalid) {
                    <small class="text-danger">Valid email address is required.</small>
                  }
                </div>

                <div class="col-md-6">
                  <label class="ds-form-label">Preferred Time Slot *</label>
                  <select class="ds-form-control" formControlName="preferredSlot">
                    @for (s of slots; track s.key) {
                      <option [value]="s.key">{{ s.label }} ({{ s.time }})</option>
                    }
                  </select>
                </div>

                <!-- Address -->
                <div class="col-12">
                  <label class="ds-form-label">Delivery Address *</label>
                  <textarea
                    class="ds-form-control"
                    rows="2"
                    placeholder="House/Flat number, Street, Landmark, City & PIN"
                    formControlName="customerAddress"
                  ></textarea>
                  @if (orderForm.get('customerAddress')?.touched && orderForm.get('customerAddress')?.invalid) {
                    <small class="text-danger">Delivery address is required.</small>
                  }
                </div>

                <!-- Assign Partner & Date -->
                <div class="col-md-6">
                  <label class="ds-form-label">Assign Delivery Partner</label>
                  <select class="ds-form-control" formControlName="assignedPartnerId">
                    <option [ngValue]="null">-- Unassigned --</option>
                    @for (partner of partners; track partner.id) {
                      <option [ngValue]="partner.id">
                        {{ partner.name }} ({{ partner.vehicleType }} &bull; {{ partner.serviceZone }})
                      </option>
                    }
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="ds-form-label">Scheduled Date *</label>
                  <input type="date" class="ds-form-control" formControlName="deliveryDate" />
                </div>

                <!-- Instructions -->
                <div class="col-12">
                  <label class="ds-form-label">Delivery Instructions</label>
                  <input
                    type="text"
                    class="ds-form-control"
                    placeholder="Optional notes for partner: e.g. Ring twice, leave with guard"
                    formControlName="deliveryInstructions"
                  />
                </div>
              </div>

              <!-- Action buttons -->
              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="ds-btn ds-btn-outline" (click)="close()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="ds-btn ds-btn-primary"
                  [disabled]="orderForm.invalid || isSubmitting"
                >
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm"></span> Saving...
                  } @else {
                    <i class="bi bi-check-lg"></i> {{ isEdit ? 'Save Changes' : 'Create Dispatch' }}
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
export class OrderFormModalComponent {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() order: DeliveryOrder | null = null;
  @Input() partners: DeliveryPartner[] = [];
  @Output() saveOrder = new EventEmitter<DeliveryOrderRequest>();
  @Output() modalClosed = new EventEmitter<void>();

  slots = DELIVERY_SLOTS;
  orderForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.orderForm = this.fb.group({
      packageDescription: ['', [Validators.required, Validators.minLength(3)]],
      customerName: ['', [Validators.required, Validators.minLength(2)]],
      customerPhone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[6-9][0-9]{9}$/)
        ]
      ],
      customerEmail: ['', [Validators.required, Validators.email]],
      customerAddress: ['', [Validators.required, Validators.minLength(5)]],
      preferredSlot: ['ANYTIME', Validators.required],
      deliveryDate: [new Date().toISOString().split('T')[0], Validators.required],
      assignedPartnerId: [null],
      deliveryInstructions: ['']
    });
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const selectedLength = (input.selectionEnd || 0) - (input.selectionStart || 0);
    if (input.value.length >= 10 && selectedLength === 0) {
      event.preventDefault();
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onPhonePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const clipboardData = event.clipboardData?.getData('text') || '';
    const digitsOnly = clipboardData.replace(/\D/g, '').slice(0, 10);
    const input = event.target as HTMLInputElement;
    input.value = digitsOnly;
    this.orderForm.get('customerPhone')?.setValue(digitsOnly);
    this.orderForm.get('customerPhone')?.markAsTouched();
    this.orderForm.get('customerPhone')?.updateValueAndValidity();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let cleaned = (input.value || '').replace(/\D/g, '');
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    input.value = cleaned;
    this.orderForm.get('customerPhone')?.setValue(cleaned);
    this.orderForm.get('customerPhone')?.updateValueAndValidity();
  }

  ngOnChanges(): void {
    if (this.isEdit && this.order) {
      this.orderForm.patchValue({
        packageDescription: this.order.packageDescription,
        customerName: this.order.customerName,
        customerPhone: this.order.customerPhone,
        customerEmail: this.order.customerEmail,
        customerAddress: this.order.customerAddress,
        preferredSlot: this.order.preferredSlot,
        deliveryDate: this.order.deliveryDate,
        assignedPartnerId: this.order.assignedPartnerId || null,
        deliveryInstructions: this.order.deliveryInstructions || ''
      });
    } else if (!this.isEdit) {
      this.orderForm.reset({
        preferredSlot: 'ANYTIME',
        deliveryDate: new Date().toISOString().split('T')[0],
        assignedPartnerId: null
      });
    }
  }

  submit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const req: DeliveryOrderRequest = {
      ...this.orderForm.value
    };
    this.saveOrder.emit(req);
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
