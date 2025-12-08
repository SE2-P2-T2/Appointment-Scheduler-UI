import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SchedulerAppointment } from '../models/Booking';
import { GroupAppointment } from '../models/group-appointment';
import { IndividualAppointment } from '../models/Individual-appointment';
import { User, UserRole } from '../models/User';
import { GroupMember } from '../models/GroupMember';
import { SchedulerService } from '../service/scheduler.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { GroupAppointmentService } from '../service/group-appointment.service';
import { IndividualAppointmentService } from '../service/individual-appointment.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scheduler',
  imports: [
    CommonModule,
    MatCardModule, 
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './scheduler.html',
  standalone: true,
  styleUrls: ['./scheduler.scss'],
})
export class Scheduler implements OnInit {
  readonly panelOpenState = signal(false);

  // Current student
  currentStudentId: number = 3;
  currentStudent: User | null = null;

  // Selected instructor
  selectedInstructor: User | null = null;

  // Instructors list
  instructors: User[] = [];
  loadingInstructors = false;

  // Available appointments
  availableIndividualAppointments: IndividualAppointment[] = [];
  availableGroupAppointments: GroupAppointment[] = [];
  loadingIndividual = false;
  loadingGroup = false;

  myBookings: SchedulerAppointment[] = [];
  loadingBookings = false;

  groupMemberCounts: { [key: number]: number } = {};
  loadingGroupCapacity: { [key: number]: boolean } = {};
  userGroupMemberships: { [key: number]: boolean } = {};
  loadingMembership: { [key: number]: boolean } = {};

  showingGroupMembers: { [key: number]: boolean } = {};
  groupMembers: { [key: number]: GroupMember[] } = {};
  loadingGroupMembers: { [key: number]: boolean } = {};

  showingMyGroupMembers: { [key: number]: boolean } = {};
  myGroupMembers: { [key: number]: GroupMember[] } = {};
  loadingMyGroupMembers: { [key: number]: boolean } = {};

  constructor(
    private userService: UserService,
    private schedulerService: SchedulerService,
    private individualAppointmentService: IndividualAppointmentService,
    private groupAppointmentService: GroupAppointmentService,
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
    this.loadMyBookings();
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

    goToGroupManagement(): void {
    this.router.navigate(['/group-management']);
  }

  selectInstructor(instructor: User): void {
    this.selectedInstructor = instructor;
    this.loadAvailableAppointments(instructor.userId);
    this.snackBar.open(
      `Selected: ${instructor.firstName} ${instructor.lastName}`,
      'Close',
      { duration: 2000 }
    );
  }

loadAvailableAppointments(instructorId: number): void {
  console.log('Loading available appointments for instructorId:', instructorId);
  
  this.loadingIndividual = true;
  this.loadingGroup = true;
  
  forkJoin({
    individualAppointments: this.individualAppointmentService.getIndividualAppointmentsByInstructor(instructorId),
    groupAppointments: this.groupAppointmentService.getAllGroups(),
    allBookings: this.schedulerService.getAllBookings()
  }).subscribe({
    next: (data) => {
      // Get booked individual appointment IDs
      const bookedIndividualIds: number[] = data.allBookings
        .filter(b => b.bookingType === 'individual' && b.status === 'confirmed')
        .map(b => b.appointmentId)
        .filter((id): id is number => id !== null && id !== undefined);
      
      // Filter individual appointments
      this.availableIndividualAppointments = data.individualAppointments.filter(
        apt => apt.appointmentId !== undefined && !bookedIndividualIds.includes(apt.appointmentId)
      );
      
      this.loadingIndividual = false;
      const unbookedGroups = data.groupAppointments.filter(
        apt => apt.instructorId === instructorId && 
               apt.groupId !== undefined && 
               !apt.isBooked
      );
      
      const membershipChecks = unbookedGroups.map(group => 
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
        this.availableGroupAppointments = results.filter((g): g is GroupAppointment => g !== null);
        this.loadingGroup = false;
        
        this.availableGroupAppointments.forEach(appointment => {
          if (appointment.groupId) {
            this.loadGroupCapacity(appointment.groupId);
          }
        });
        
        console.log('Available group appointments (user is member):', this.availableGroupAppointments);
      });
      
      console.log('Available individual appointments:', this.availableIndividualAppointments);
    },
    error: (error) => {
      console.error('Error loading appointments:', error);
      this.loadingIndividual = false;
      this.loadingGroup = false;
      this.snackBar.open('Failed to load appointments', 'Close', { duration: 3000 });
    }
  });
}

  loadAllGroupData(): void {
    this.availableGroupAppointments.forEach(appointment => {
      if (appointment.groupId) {
        this.loadGroupCapacity(appointment.groupId);
        this.checkUserMembership(appointment.groupId);
      }
    });
  }


  loadGroupCapacity(groupId: number): void {
    this.loadingGroupCapacity[groupId] = true;
    this.groupAppointmentService.getGroupMemberCount(groupId).subscribe({
      next: (count) => {
        this.groupMemberCounts[groupId] = count;
        this.loadingGroupCapacity[groupId] = false;
        console.log(`Group ${groupId} has ${count} members`);
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
        console.log(`User is ${isMember ? '' : 'not '}a member of group ${groupId}`);
      },
      error: (error) => {
        console.error(`Error checking membership for group ${groupId}:`, error);
        this.userGroupMemberships[groupId] = false;
        this.loadingMembership[groupId] = false;
      }
    });
  }

  isGroupFull(groupId: number): boolean {
    const appointment = this.availableGroupAppointments.find(apt => apt.groupId === groupId);
    if (!appointment || !appointment.maxLimit) return false;
    
    const currentCount = this.groupMemberCounts[groupId] || 0;
    return currentCount >= appointment.maxLimit;
  }

  hasMinimumMembers(groupId: number): boolean {
    const currentCount = this.groupMemberCounts[groupId] || 0;
    return currentCount >= 2;
  }

  isUserMember(groupId: number): boolean {
    return this.userGroupMemberships[groupId] || false;
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

  bookGroupForAll(groupId: number, description: string): void {
    if (!this.hasMinimumMembers(groupId)) {
      this.snackBar.open('Group needs at least 2 members to book!', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('This will book the appointment for ALL members of the group. Continue?')) {
      return;
    }

    this.schedulerService.bookGroupForAll(this.currentStudentId, groupId, description).subscribe({
      next: (booking) => {
        this.snackBar.open('Group appointment booked successfully for all members!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadMyBookings();
        if (this.selectedInstructor) {
          this.loadAvailableAppointments(this.selectedInstructor.userId);
        }
      },
      error: (error) => {
        console.error('Error booking group appointment:', error);
        const errorMsg = error.error?.message || error.error || 'Failed to book group appointment';
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
  
  bookIndividualAppointment(appointmentId: number, description: string): void {
    if (!appointmentId) {
      this.snackBar.open('Invalid appointment', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('Are you sure you want to book this appointment?')) {
      return;
    }

    this.schedulerService.bookIndividualAppointment(this.currentStudentId, appointmentId, description).subscribe({
      next: (booking) => {
        this.snackBar.open('Appointment booked successfully!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadMyBookings();
        if (this.selectedInstructor) {
          this.loadAvailableAppointments(this.selectedInstructor.userId);
        }
      },
      error: (error) => {
        console.error('Error booking appointment:', error);
        const errorMsg = error.error?.message || 'Failed to book appointment';
        this.snackBar.open(errorMsg, 'Close', {
          duration: 4000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
  
  loadMyBookings(): void {
    this.loadingBookings = true;
    
    this.schedulerService.getStudentBookings(this.currentStudentId).subscribe({
      next: (data) => {
        this.myBookings = data.filter(booking => {
          const status = booking.status?.toLowerCase();
          return status === 'confirmed' || status === 'cancelled';
        });
        
        this.loadingBookings = false;
        console.log('My bookings:', this.myBookings);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loadingBookings = false;
        this.snackBar.open('Failed to load your bookings', 'Close', { duration: 3000 });
      }
    });
  }

  toggleMyGroupMembers(groupId: number): void {
    if (this.showingMyGroupMembers[groupId]) {
      this.showingMyGroupMembers[groupId] = false;
      return;
    }

    this.loadingMyGroupMembers[groupId] = true;
    this.schedulerService.getGroupMembers(groupId).subscribe({
      next: (members) => {
        this.myGroupMembers[groupId] = members;
        this.showingMyGroupMembers[groupId] = true;
        this.loadingMyGroupMembers[groupId] = false;
      },
      error: (error) => {
        console.error(`Error loading members for group ${groupId}:`, error);
        this.loadingMyGroupMembers[groupId] = false;
        this.myGroupMembers[groupId] = [];
      }
    });
  }
  
  cancelBooking(bookingId: number): void {
    if (!bookingId) return;

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason || reason.trim() === '') {
      this.snackBar.open('Cancellation reason is required', 'Close', { duration: 3000 });
      return;
    }

    this.schedulerService.cancelBooking(bookingId, reason).subscribe({
      next: () => {
        this.snackBar.open('Booking cancelled successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadMyBookings();
        if (this.selectedInstructor) {
          this.loadAvailableAppointments(this.selectedInstructor.userId);
        }
      },
      error: (error) => {
        console.error('Error cancelling booking:', error);
        this.snackBar.open('Failed to cancel booking', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  
  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getInstructorFullName(instructor: User | null): string {
    if (!instructor) return 'N/A';
    return `${instructor.firstName} ${instructor.lastName}`;
  }

  getUserRoleId(user: User): number {
    return user.role?.roleId || 0;
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

  formatFullDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getBookingStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'booked';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}