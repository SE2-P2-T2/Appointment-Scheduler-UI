import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../service/admin.service';
import { User } from '../models/User';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin',
  templateUrl: './admin-component.html',
  styleUrls: ['./admin-component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class AdminComponent implements OnInit {

  pendingStudents: User[] = [];
  pendingInstructors: User[] = [];
  pendingTAs: User[] = [];

  pendingStudentInstructorMappings: any[] = [];
  pendingTAInstructorMappings: any[] = [];

  // Separate loading flags
  loadingStudents = false;
  loadingInstructors = false;
  loadingTAs = false;
  loadingStudentInstructorMappings = false;
  loadingTAInstructorMappings = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchAllPending();
  }

  fetchAllPending() {
    this.fetchPendingStudents();
    this.fetchPendingInstructors();
    this.fetchPendingTAs();
    this.fetchPendingStudentInstructorMappings();
    this.fetchPendingTAInstructorMappings();
  }

  // -------------------- FETCH METHODS --------------------

  fetchPendingStudents() {
    this.loadingStudents = true;
    this.adminService.getPendingStudents().subscribe({
      next: (res: User[]) => this.pendingStudents = res,
      error: (err: any) => console.error(err),
      complete: () => this.loadingStudents = false
    });
  }

  fetchPendingInstructors() {
    this.loadingInstructors = true;
    this.adminService.getPendingInstructors().subscribe({
      next: (res: User[]) => this.pendingInstructors = res,
      error: (err: any) => console.error(err),
      complete: () => this.loadingInstructors = false
    });
  }

  fetchPendingTAs() {
    this.loadingTAs = true;
    this.adminService.getPendingTAs().subscribe({
      next: (res: User[]) => this.pendingTAs = res,
      error: (err: any) => console.error(err),
      complete: () => this.loadingTAs = false
    });
  }

  fetchPendingStudentInstructorMappings() {
    this.loadingStudentInstructorMappings = true;
    this.adminService.getPendingStudentInstructorMappings().subscribe({
      next: (res: any[]) => this.pendingStudentInstructorMappings = res,
      error: (err: any) => console.error(err),
      complete: () => this.loadingStudentInstructorMappings = false
    });
  }

  fetchPendingTAInstructorMappings() {
    this.loadingTAInstructorMappings = true;
    this.adminService.getPendingTAInstructorMappings().subscribe({
      next: (res: any[]) => this.pendingTAInstructorMappings = res,
      error: (err: any) => console.error(err),
      complete: () => this.loadingTAInstructorMappings = false
    });
  }

  // -------------------- USER APPROVE/REJECT --------------------

  approveUser(userId: number) {
    this.adminService.approveUser(userId).subscribe({
      next: () => {
        this.snackBar.open('User approved!', 'Close', { duration: 2000 });
        this.fetchAllPending();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error approving user', 'Close', { duration: 2000 });
      }
    });
  }

  rejectUser(userId: number) {
    this.adminService.rejectUser(userId).subscribe({
      next: () => {
        this.snackBar.open('User rejected!', 'Close', { duration: 2000 });
        this.fetchAllPending();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error rejecting user', 'Close', { duration: 2000 });
      }
    });
  }

  // -------------------- STUDENT-INSTRUCTOR MAPPINGS --------------------

  approveStudentInstructorMapping(mappingId: number) {
    this.adminService.approveStudentInstructorMapping(mappingId).subscribe({
      next: () => {
        this.snackBar.open('Mapping approved!', 'Close', { duration: 2000 });
        this.fetchPendingStudentInstructorMappings();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error approving mapping', 'Close', { duration: 2000 });
      }
    });
  }

  rejectStudentInstructorMapping(mappingId: number) {
    this.adminService.rejectStudentInstructorMapping(mappingId).subscribe({
      next: () => {
        this.snackBar.open('Mapping rejected!', 'Close', { duration: 2000 });
        this.fetchPendingStudentInstructorMappings();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error rejecting mapping', 'Close', { duration: 2000 });
      }
    });
  }

  // -------------------- TA-INSTRUCTOR MAPPINGS --------------------

  approveTAInstructorMapping(mappingId: number) {
    this.adminService.approveTAInstructorMapping(mappingId).subscribe({
      next: () => {
        this.snackBar.open('TA-Instructor mapping approved!', 'Close', { duration: 2000 });
        this.fetchPendingTAInstructorMappings();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error approving mapping', 'Close', { duration: 2000 });
      }
    });
  }

  rejectTAInstructorMapping(mappingId: number) {
    this.adminService.rejectTAInstructorMapping(mappingId).subscribe({
      next: () => {
        this.snackBar.open('TA-Instructor mapping rejected!', 'Close', { duration: 2000 });
        this.fetchPendingTAInstructorMappings();
      },
      error: (err: any) => {
        console.error(err);
        this.snackBar.open('Error rejecting mapping', 'Close', { duration: 2000 });
      }
    });
  }

}
