import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryPartner, DeliveryPartnerRequest } from '../../models/delivery.model';

@Component({
  selector: 'app-partner-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="ds-modal-backdrop" (click)="onBackdropClick($event)">
        <div class="ds-modal-dialog" (click)="$event.stopPropagation()">
          <div class="ds-card-header">
            <h5 class="ds-card-title">
              <i class="bi bi-person-badge text-primary"></i>
              {{ isEdit ? 'Update Fleet Partner' : 'Register Delivery Partner' }}
            </h5>
            <button type="button" class="btn-close" (click)="close()"></button>
          </div>

          <div class="ds-card-body">
            <form [formGroup]="partnerForm" (ngSubmit)="submit()">
              <div class="row g-3">
                <!-- Name -->
                <div class="col-12">
                  <label class="ds-form-label">Partner Full Name *</label>
                  <input
                    type="text"
                    class="ds-form-control"
                    placeholder="e.g. Rajesh Sharma"
                    formControlName="name"
                  />
                  @if (partnerForm.get('name')?.touched && partnerForm.get('name')?.invalid) {
                    <small class="text-danger">Partner name is required.</small>
                  }
                </div>

                <!-- Phone & Email -->
                <div class="col-md-6">
                  <label class="ds-form-label">Mobile Number (Exactly 10 Digits) *</label>
                  <input
                    type="text"
                    inputmode="numeric"
                    class="ds-form-control"
                    placeholder="e.g. 9876543210"
                    formControlName="phone"
                    maxlength="10"
                    (input)="onPhoneInput($event)"
                    (keypress)="onlyNumbers($event)"
                    (paste)="onPhonePaste($event)"
                  />
                  @if (partnerForm.get('phone')?.touched && partnerForm.get('phone')?.invalid) {
                    <small class="text-danger">
                      @if (partnerForm.get('phone')?.errors?.['required']) {
                        Mobile number is required.
                      } @else if (partnerForm.get('phone')?.errors?.['pattern'] || partnerForm.get('phone')?.errors?.['maxlength'] || partnerForm.get('phone')?.errors?.['minlength']) {
                        Must be exactly 10 digits starting with 6, 7, 8, or 9.
                      }
                    </small>
                  }
                </div>

                <div class="col-md-6">
                  <label class="ds-form-label">Email Address *</label>
                  <input
                    type="email"
                    class="ds-form-control"
                    placeholder="e.g. partner@dropslot.com"
                    formControlName="email"
                  />
                  @if (partnerForm.get('email')?.touched && partnerForm.get('email')?.invalid) {
                    <small class="text-danger">Valid email required.</small>
                  }
                </div>

                <!-- Vehicle Type & Zone -->
                <div class="col-md-6">
                  <label class="ds-form-label">Vehicle Type *</label>
                  <select class="ds-form-control" formControlName="vehicleType">
                    <option value="Electric Cargo Van">Electric Cargo Van</option>
                    <option value="Electric Bike">Electric Bike</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="EV 3-Wheeler">EV 3-Wheeler</option>
                    <option value="Bicycle">Bicycle</option>
                  </select>
                </div>

                <div class="col-md-6">
                  <label class="ds-form-label">Max Slot Capacity (Packages) *</label>
                  <input
                    type="number"
                    class="ds-form-control"
                    formControlName="maxCapacityPerSlot"
                    min="1"
                    max="30"
                  />
                </div>

                <div class="col-12">
                  <label class="ds-form-label">Service Zone / Hub Coverage *</label>
                  <input
                    type="text"
                    class="ds-form-control"
                    placeholder="e.g. South Bangalore - Koramangala / HSR Sector 1-4"
                    formControlName="serviceZone"
                  />
                  @if (partnerForm.get('serviceZone')?.touched && partnerForm.get('serviceZone')?.invalid) {
                    <small class="text-danger">Service zone is required.</small>
                  }
                </div>
              </div>

              <!-- Actions -->
              <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                <button type="button" class="ds-btn ds-btn-outline" (click)="close()">
                  Cancel
                </button>
                <button
                  type="submit"
                  class="ds-btn ds-btn-primary"
                  [disabled]="partnerForm.invalid || isSubmitting"
                >
                  @if (isSubmitting) {
                    <span class="spinner-border spinner-border-sm"></span> Saving...
                  } @else {
                    <i class="bi bi-check-lg"></i> {{ isEdit ? 'Save Changes' : 'Register Partner' }}
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
export class PartnerFormModalComponent {
  @Input() isOpen = false;
  @Input() isEdit = false;
  @Input() partner: DeliveryPartner | null = null;
  @Output() savePartner = new EventEmitter<DeliveryPartnerRequest>();
  @Output() modalClosed = new EventEmitter<void>();

  partnerForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.partnerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern(/^[6-9][0-9]{9}$/)
        ]
      ],
      email: ['', [Validators.required, Validators.email]],
      vehicleType: ['Electric Bike', Validators.required],
      serviceZone: ['', [Validators.required, Validators.minLength(3)]],
      maxCapacityPerSlot: [8, [Validators.required, Validators.min(1)]]
    });
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    // Disallow if already 10 digits and user is not replacing selected text
    const selectedLength = (input.selectionEnd || 0) - (input.selectionStart || 0);
    if (input.value.length >= 10 && selectedLength === 0) {
      event.preventDefault();
      return false;
    }
    const charCode = event.which ? event.which : event.keyCode;
    // Allow only numeric digits 0-9
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
    this.partnerForm.get('phone')?.setValue(digitsOnly);
    this.partnerForm.get('phone')?.markAsTouched();
    this.partnerForm.get('phone')?.updateValueAndValidity();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Strip non-digit characters and truncate strictly to 10
    let cleaned = (input.value || '').replace(/\D/g, '');
    if (cleaned.length > 10) {
      cleaned = cleaned.substring(0, 10);
    }
    input.value = cleaned;
    this.partnerForm.get('phone')?.setValue(cleaned);
    this.partnerForm.get('phone')?.updateValueAndValidity();
  }

  ngOnChanges(): void {
    if (this.isEdit && this.partner) {
      this.partnerForm.patchValue({
        name: this.partner.name,
        phone: this.partner.phone,
        email: this.partner.email,
        vehicleType: this.partner.vehicleType,
        serviceZone: this.partner.serviceZone,
        maxCapacityPerSlot: this.partner.maxCapacityPerSlot
      });
    } else if (!this.isEdit) {
      this.partnerForm.reset({
        vehicleType: 'Electric Bike',
        maxCapacityPerSlot: 8
      });
    }
  }

  submit(): void {
    if (this.partnerForm.invalid) {
      this.partnerForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const req: DeliveryPartnerRequest = {
      ...this.partnerForm.value
    };
    this.savePartner.emit(req);
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
