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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { IndividualAppointment } from '../models/Individual-appointment';
import { GroupAppointment } from '../models/group-appointment';
import { CommonModule } from '@angular/common';

export interface CreateAppointmentDialogData {
  instructorId: number;
}

export interface AppointmentDialogResult {
  type: 'individual' | 'group';
  data: IndividualAppointment | GroupAppointment;
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
    MatSlideToggleModule,
    MatDatepickerModule
  ],
  providers: [
    
  ],
})
export class CreateAppointmentDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CreateAppointmentDialogComponent>);
  readonly data = inject<CreateAppointmentDialogData>(MAT_DIALOG_DATA);


  isGroupAppointment = signal(false);


  instructorId = this.data.instructorId;
  startTime = model('');
  endTime = model('');
  description = model('');


  appointmentDate = model<Date | null>(null);
  location = model('');


  groupName = model('');
  maxLimit = model<number | null>(null);

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    if (this.isGroupAppointment()) {
      const groupAppointment: GroupAppointment = {
        groupName: this.groupName(),
        instructorId: this.instructorId,
        maxLimit: this.maxLimit() || undefined,
        startTime: this.startTime(),
        endTime: this.endTime(),
        description: this.description(),
      };

      const result: AppointmentDialogResult = {
        type: 'group',
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
    const commonValid = !!(
      this.instructorId &&
      this.startTime() &&
      this.endTime()
    );

    if (this.isGroupAppointment()) {
      return commonValid && !!this.groupName();
    } else {
      return commonValid && !!this.appointmentDate();
    }
  }

  onToggleChange(): void {

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
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}