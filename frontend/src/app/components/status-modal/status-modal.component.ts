import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DELIVERY_STATUSES, DeliveryOrder, DeliveryStatusType, StatusUpdate } from '../../models/delivery.model';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './status-modal.component.html',
  styleUrls: ['./status-modal.component.css']
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
