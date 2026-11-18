import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_SLOTS, DeliveryOrder, DeliverySlotType, SlotRequest } from '../../models/delivery.model';

@Component({
  selector: 'app-slot-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './slot-modal.component.html',
  styleUrls: ['./slot-modal.component.css']
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
