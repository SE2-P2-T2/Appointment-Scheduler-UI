import { Component, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { IndividualAppointment } from '../models/Individual-appointment';
import { Groups } from '../models/Groups';
import { GroupAppointment } from '../models/group-appointment';
import { CommonModule } from '@angular/common';

export interface CreateAppointmentDialogData {
  instructorId: number;
  availableGroups?: Groups[];
}

export interface AppointmentDialogResult {
  type: 'individual' | 'groupSlot' | 'groupAppointment';
  data: IndividualAppointment | Groups | GroupAppointment;
}

@Component({
  selector: 'app-create-appointment-dialog',
  templateUrl: './create-appointment-dialog.html',
  styleUrls: ['./create-appointment-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatRadioModule
  ],
  providers: [

  ],
})
export class CreateAppointmentDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CreateAppointmentDialogComponent>);
  readonly data = inject<CreateAppointmentDialogData>(MAT_DIALOG_DATA);

  appointmentType = signal<'individual' | 'groupSlot' | 'groupAppointment'>('individual');

  instructorId = this.data.instructorId;
  availableGroups = this.data.availableGroups || [];

  startTime = model('');
  endTime = model('');
  description = model('');

  appointmentDate = model<Date | null>(null);
  location = model('');

  groupName = model('');
  maxLimit = model<number | null>(null);

  groupAppointmentDate = model<Date | null>(null);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    const type = this.appointmentType();

    if (type === 'groupSlot') {
      const groupSlot: Groups = {
        groupName: this.groupName(),
        instructorId: this.instructorId,
        maxMembers: this.maxLimit() || undefined,
      };

      const result: AppointmentDialogResult = {
        type: 'groupSlot',
        data: groupSlot,
      };

      this.dialogRef.close(result);
    } else if (type === 'groupAppointment') {
      const groupAppointment: GroupAppointment = {
        instructorId: this.instructorId,
        appointmentDate: this.formatDate(this.groupAppointmentDate()!),
        startTime: this.startTime(),
        endTime: this.endTime(),
        description: this.description(),
        status: 'available',
      };

      const result: AppointmentDialogResult = {
        type: 'groupAppointment',
        data: groupAppointment,
      };

      this.dialogRef.close(result);
    } else {
      const individualAppointment: IndividualAppointment = {
        instructorId: this.instructorId,
        appointmentDate: this.formatDate(this.appointmentDate()!),
        startTime: this.startTime(),
        endTime: this.endTime(),
        location: this.location(),
        description: this.description(),
        status: 'available',
      };

      const result: AppointmentDialogResult = {
        type: 'individual',
        data: individualAppointment,
      };

      this.dialogRef.close(result);
    }
  }

  isFormValid(): boolean {
    const type = this.appointmentType();

    if (type === 'groupSlot') {
      return !!(this.instructorId && this.groupName());
    } else if (type === 'groupAppointment') {
      return !!(
        this.instructorId &&
        this.groupAppointmentDate() &&
        this.startTime() &&
        this.endTime()
      );
    } else {
      return !!(
        this.instructorId &&
        this.appointmentDate() &&
        this.startTime() &&
        this.endTime()
      );
    }
  }

  onTypeChange(): void {
    this.resetFields();
  }

  private resetFields(): void {
    this.startTime.set('');
    this.endTime.set('');
    this.description.set('');
    this.appointmentDate.set(null);
    this.location.set('');
    this.groupName.set('');
    this.maxLimit.set(null);
    this.groupAppointmentDate.set(null);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}