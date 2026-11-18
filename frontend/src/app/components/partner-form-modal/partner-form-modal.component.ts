import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryPartner, DeliveryPartnerRequest } from '../../models/delivery.model';

@Component({
  selector: 'app-partner-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './partner-form-modal.component.html',
  styleUrls: ['./partner-form-modal.component.css']
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
    this.partnerForm.get('phone')?.setValue(digitsOnly);
    this.partnerForm.get('phone')?.markAsTouched();
    this.partnerForm.get('phone')?.updateValueAndValidity();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
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
