import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_SLOTS, DeliveryOrder, DeliveryOrderRequest, DeliveryPartner } from '../../models/delivery.model';

@Component({
  selector: 'app-order-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form-modal.component.html',
  styleUrls: ['./order-form-modal.component.css']
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
