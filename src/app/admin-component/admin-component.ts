import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService, User, StudentInstructorRequest } from '../service/admin.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-admin-component',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatListModule,
    MatExpansionModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './admin-component.html',
  styleUrls: ['./admin-component.scss'],
})
export class AdminComponent implements OnInit {
  pendingUsers$: Observable<User[]> = new Observable<User[]>();
  pendingLinks$: Observable<StudentInstructorRequest[]> = new Observable<StudentInstructorRequest[]>();
  allUsers$: Observable<User[]> = new Observable<User[]>();
  displayedColumns: string[] = ['name', 'email', 'role', 'signup_status', 'actions'];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.pendingUsers$ = this.adminService.getPendingUsers();
    this.pendingLinks$ = this.adminService.getStudentInstructorRequests();
    this.allUsers$ = this.adminService.getPendingUsers(); // dummy, replace with getAllUsers later
  }

  approveUser(id: number) {
    this.adminService.approveUser(id);
  }

  rejectUser(id: number) {
    this.adminService.rejectUser(id);
  }

  approveLink(id: number) {
    this.adminService.approveStudentInstructor(id);
  }

  rejectLink(id: number) {
    this.adminService.rejectStudentInstructor(id);
  }
}
