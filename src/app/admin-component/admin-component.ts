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


  loadingStudents = false;
  loadingInstructors = false;
  loadingTAs = false;

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
  }


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

}
