import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../models/User';
import { UserService } from '../service/user.service';

export interface SelectProfessorDialogData {
  studentId: number;
  assignedProfessorIds?: number[];
}

@Component({
  selector: 'app-select-professor-dialog',
  templateUrl: './select-professor-dialog.html',
  styleUrls: ['./select-professor-dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatProgressSpinnerModule
  ],
})
export class SelectProfessorDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SelectProfessorDialogComponent>);
  readonly data = inject<SelectProfessorDialogData | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly userService = inject(UserService);

  professors = signal<User[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  selectedProfessor = signal<User | null>(null);

  constructor() {}

  ngOnInit(): void {
    this.loadProfessors();
  }

  loadProfessors(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userService.getProfessors().subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          const assignedProfessorIds = this.data?.assignedProfessorIds || [];
          const availableProfessors = data.filter(
            prof => !assignedProfessorIds.includes(prof.userId)
          );
          this.professors.set(availableProfessors);
        } else {
          this.professors.set([]);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading professors:', err);
        this.error.set('Failed to load professors');
        this.loading.set(false);
        this.professors.set([]);
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.selectedProfessor()) {
      this.dialogRef.close(this.selectedProfessor());
    }
  }

  isFormValid(): boolean {
    return this.selectedProfessor() !== null;
  }
}
