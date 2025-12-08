import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { GroupAppointment } from '../models/group-appointment';
import { GroupMember } from '../models/GroupMember';
import { User, UserRole } from '../models/User';
import { GroupAppointmentService } from '../service/group-appointment.service';
import { SchedulerService } from '../service/scheduler.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule
  ],
  templateUrl: './group-management.component.html',
  styleUrls: ['./group-management.component.scss']
})
export class GroupManagementComponent implements OnInit {
  
  // Current student
  currentStudentId: number = 3;
  currentStudent: User | null = null;

  // Selected instructor
  selectedInstructor: User | null = null;
  instructors: User[] = [];
  loadingInstructors = false;

  // Available groups (not yet booked)
  availableGroups: GroupAppointment[] = [];
  loadingGroups = false;

  // Groups user has joined
  myGroups: GroupAppointment[] = [];
  loadingMyGroups = false;

  // Group data
  groupMemberCounts: { [key: number]: number } = {};
  loadingGroupCapacity: { [key: number]: boolean } = {};
  userGroupMemberships: { [key: number]: boolean } = {}; // Which groups user has joined
  loadingMembership: { [key: number]: boolean } = {};

  // Group members display
  showingGroupMembers: { [key: number]: boolean } = {};
  groupMembers: { [key: number]: GroupMember[] } = {};
  loadingGroupMembers: { [key: number]: boolean } = {};

  constructor(
    private groupAppointmentService: GroupAppointmentService,
    private schedulerService: SchedulerService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentStudentId = currentUser.userId;
      this.currentStudent = currentUser;
      console.log('Current student:', currentUser);
    }

    this.loadInstructors();
  }

    goBackToScheduler(): void {
    this.router.navigate(['/scheduler']);
  }
  
  loadInstructors(): void {
    this.loadingInstructors = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.instructors = data.filter(user => user.role?.roleId === UserRole.INSTRUCTOR);
        this.loadingInstructors = false;
        console.log('Loaded instructors:', this.instructors);
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.loadingInstructors = false;
        this.snackBar.open('Failed to load instructors', 'Close', { duration: 3000 });
      }
    });
  }

  selectInstructor(instructor: User): void {
    this.selectedInstructor = instructor;
    this.loadAvailableGroups(instructor.userId);
    this.snackBar.open(
      `Selected: ${instructor.firstName} ${instructor.lastName}`,
      'Close',
      { duration: 2000 }
    );
  }

  
  loadAvailableGroups(instructorId: number): void {
    console.log('Loading available groups for instructor:', instructorId);
    
    this.loadingGroups = true;
    
    this.groupAppointmentService.getAllGroups().subscribe({
      next: (data) => {
        // Filter: only unbooked groups for this instructor
        this.availableGroups = data.filter(
          group => group.instructorId === instructorId && !group.isBooked
        );
        
        this.loadingGroups = false;
        console.log('Available groups:', this.availableGroups);
        
        // Load group data
        this.loadAllGroupData();
        
        // Load groups user has joined
        this.loadMyGroups();
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loadingGroups = false;
        this.snackBar.open('Failed to load groups', 'Close', { duration: 3000 });
      }
    });
  }
  
  loadMyGroups(): void {
    this.loadingMyGroups = true;
    
    // Get all groups where user is a member
    const membershipChecks = this.availableGroups.map(group => 
      new Promise<GroupAppointment | null>((resolve) => {
        if (!group.groupId) {
          resolve(null);
          return;
        }
        
        this.schedulerService.isUserMemberOfGroup(this.currentStudentId, group.groupId).subscribe({
          next: (isMember) => {
            if (isMember) {
              resolve(group);
            } else {
              resolve(null);
            }
          },
          error: () => resolve(null)
        });
      })
    );

    Promise.all(membershipChecks).then(results => {
      this.myGroups = results.filter((g): g is GroupAppointment => g !== null);
      this.loadingMyGroups = false;
      console.log('My groups:', this.myGroups);
    });
  }
  
  loadAllGroupData(): void {
    this.availableGroups.forEach(group => {
      if (group.groupId) {
        this.loadGroupCapacity(group.groupId);
        this.checkUserMembership(group.groupId);
      }
    });
  }

  loadGroupCapacity(groupId: number): void {
    this.loadingGroupCapacity[groupId] = true;
    this.groupAppointmentService.getGroupMemberCount(groupId).subscribe({
      next: (count) => {
        this.groupMemberCounts[groupId] = count;
        this.loadingGroupCapacity[groupId] = false;
      },
      error: (error) => {
        console.error(`Error loading capacity for group ${groupId}:`, error);
        this.groupMemberCounts[groupId] = 0;
        this.loadingGroupCapacity[groupId] = false;
      }
    });
  }

  checkUserMembership(groupId: number): void {
    this.loadingMembership[groupId] = true;
    this.schedulerService.isUserMemberOfGroup(this.currentStudentId, groupId).subscribe({
      next: (isMember) => {
        this.userGroupMemberships[groupId] = isMember;
        this.loadingMembership[groupId] = false;
      },
      error: (error) => {
        console.error(`Error checking membership for group ${groupId}:`, error);
        this.userGroupMemberships[groupId] = false;
        this.loadingMembership[groupId] = false;
      }
    });
  }

  joinGroup(groupId: number): void {
    if (!groupId) {
      this.snackBar.open('Invalid group', 'Close', { duration: 3000 });
      return;
    }

    if (this.isGroupFull(groupId)) {
      this.snackBar.open('This group is full!', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('Do you want to join this group?')) {
      return;
    }

    this.schedulerService.joinGroup(this.currentStudentId, groupId).subscribe({
      next: (member) => {
        this.snackBar.open('Successfully joined the group!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadGroupCapacity(groupId);
        this.checkUserMembership(groupId);
        this.loadMyGroups();
      },
      error: (error) => {
        console.error('Error joining group:', error);
        const errorMsg = error.error?.message || error.error || 'Failed to join group';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  leaveGroup(groupId: number): void {
    if (!confirm('Are you sure you want to leave this group?')) {
      return;
    }

    this.schedulerService.leaveGroup(this.currentStudentId, groupId).subscribe({
      next: () => {
        this.snackBar.open('Left the group successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadGroupCapacity(groupId);
        this.checkUserMembership(groupId);
        this.loadMyGroups();
      },
      error: (error) => {
        console.error('Error leaving group:', error);
        const errorMsg = error.error?.message || error.error || 'Failed to leave group';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  toggleGroupMembers(groupId: number): void {
    if (this.showingGroupMembers[groupId]) {
      this.showingGroupMembers[groupId] = false;
      return;
    }

    this.loadingGroupMembers[groupId] = true;
    this.schedulerService.getGroupMembers(groupId).subscribe({
      next: (members) => {
        this.groupMembers[groupId] = members;
        this.showingGroupMembers[groupId] = true;
        this.loadingGroupMembers[groupId] = false;
      },
      error: (error) => {
        console.error(`Error loading members for group ${groupId}:`, error);
        this.loadingGroupMembers[groupId] = false;
        this.groupMembers[groupId] = [];
      }
    });
  }

  isGroupFull(groupId: number): boolean {
    const group = this.availableGroups.find(g => g.groupId === groupId);
    if (!group || !group.maxLimit) return false;
    
    const currentCount = this.groupMemberCounts[groupId] || 0;
    return currentCount >= group.maxLimit;
  }

  isUserMember(groupId: number): boolean {
    return this.userGroupMemberships[groupId] || false;
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getInstructorFullName(instructor: User | null): string {
    if (!instructor) return 'N/A';
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  formatTime(time: string | undefined): string {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}