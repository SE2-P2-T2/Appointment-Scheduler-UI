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
import { GroupMember } from '../models/GroupMember';

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

  currentStudentId: number = 3;
  currentStudent: User | null = null;

  
  selectedInstructor: User | null = null;


  instructors: User[] = [];
  loadingInstructors = false;


  availableIndividualAppointments: IndividualAppointment[] = [];
  availableGroupAppointments: GroupAppointment[] = [];
  loadingIndividual = false;
  loadingGroup = false;


  myBookings: SchedulerAppointment[] = [];
  loadingBookings = false;


  groupMemberCounts: { [key: number]: number } = {};
  loadingGroupCapacity: { [key: number]: boolean } = {};

  showingMyGroupMembers: { [key: number]: boolean } = {};
  myGroupMembers: { [key: number]: GroupMember[] } = {};
  loadingMyGroupMembers: { [key: number]: boolean } = {};

  bookingsWithDetails: any[] = [];

  constructor(
    private userService: UserService,
    private schedulerService: SchedulerService,
    private individualAppointmentService: IndividualAppointmentService,
    private groupAppointmentService: GroupAppointmentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
        this.snackBar.open('Failed to load instructors', 'Close', {
          duration: 3000
        });
      }
    });
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
      const bookedIndividualIds: number[] = data.allBookings
        .filter(b => b.bookingType === 'individual' && b.status === 'confirmed')
        .map(b => b.appointmentId)
        .filter((id): id is number => id !== null && id !== undefined);
      
      const bookedGroupIds: number[] = data.allBookings
        .filter(b => b.bookingType === 'group' && b.status === 'confirmed')
        .map(b => b.groupId)
        .filter((id): id is number => id !== null && id !== undefined);
      
      const studentBookedGroupIds: number[] = data.allBookings
        .filter(b => 
          b.bookingType === 'group' && 
          b.status === 'confirmed' && 
          b.studentId === this.currentStudentId
        )
        .map(b => b.groupId)
        .filter((id): id is number => id !== null && id !== undefined);
      
      console.log('Booked individual IDs:', bookedIndividualIds);
      console.log('Booked group IDs:', bookedGroupIds);
      console.log('Student booked group IDs:', studentBookedGroupIds);
      
      this.availableIndividualAppointments = data.individualAppointments.filter(
        apt => apt.appointmentId !== undefined && !bookedIndividualIds.includes(apt.appointmentId)
      );
      
      this.availableGroupAppointments = data.groupAppointments.filter(
        apt => apt.instructorId === instructorId && 
               apt.groupId !== undefined && 
               !studentBookedGroupIds.includes(apt.groupId)
      );
      
      this.loadingIndividual = false;
      this.loadingGroup = false;
      
      this.loadGroupCapacities();
      
      console.log('Available individual appointments:', this.availableIndividualAppointments);
      console.log('Available group appointments:', this.availableGroupAppointments);
    },
    error: (error) => {
      console.error('Error loading appointments:', error);
      this.loadingIndividual = false;
      this.loadingGroup = false;
      this.snackBar.open('Failed to load appointments', 'Close', {
        duration: 3000
      });
    }
  });
}

  loadGroupCapacities(): void {
    this.availableGroupAppointments.forEach(appointment => {
      if (appointment.groupId) {
        this.loadGroupCapacity(appointment.groupId);
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

  isGroupFull(groupId: number): boolean {
    const appointment = this.availableGroupAppointments.find(apt => apt.groupId === groupId);
    if (!appointment || !appointment.maxLimit) return false;
    
    const currentCount = this.groupMemberCounts[groupId] || 0;
    return currentCount >= appointment.maxLimit;
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
        console.log('My bookings (filtered - confirmed/cancelled only):', this.myBookings);
        this.enrichBookingsWithDetails();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loadingBookings = false;
        this.snackBar.open('Failed to load your bookings', 'Close', {
          duration: 3000
        });
      }
    });
  }


  toggleMyGroupMembers(groupId: number): void {
    if (this.showingMyGroupMembers[groupId]) {
      this.showingMyGroupMembers[groupId] = false;
      return;
    }

  this.loadingMyGroupMembers[groupId] = true;
  this.groupAppointmentService.getGroupMembers(groupId).subscribe({
    next: (members) => {
      this.myGroupMembers[groupId] = members;
      this.showingMyGroupMembers[groupId] = true;
      this.loadingMyGroupMembers[groupId] = false;
      console.log(`Loaded ${members.length} members for my booked group ${groupId}`);
    },
    error: (error) => {
      console.error(`Error loading members for group ${groupId}:`, error);
      this.loadingMyGroupMembers[groupId] = false;
      this.myGroupMembers[groupId] = [];
    }
  });
}

  isArray(value: any): boolean {
    return Array.isArray(value);
  }


  enrichBookingsWithDetails(): void {
    this.bookingsWithDetails = this.myBookings.map(booking => ({
      ...booking,
      appointmentDetails: null
    }));
  }


  bookIndividualAppointment(appointmentId: number, description: string): void {
    if (!appointmentId) {
      this.snackBar.open('Invalid appointment', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('Are you sure you want to book this appointment?')) {
      return;
    }

    this.schedulerService
      .bookIndividualAppointment(this.currentStudentId, appointmentId, description)
      .subscribe({
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

  bookGroupAppointment(groupId: number, description: string): void {
    if (!groupId) {
      this.snackBar.open('Invalid group appointment', 'Close', { duration: 3000 });
      return;
    }

    if (this.isGroupFull(groupId)) {
      this.snackBar.open('This group is full!', 'Close', { duration: 3000 });
      return;
    }

    if (!confirm('Are you sure you want to book this group appointment?')) {
      return;
    }

    this.schedulerService
      .bookGroupAppointment(this.currentStudentId, groupId, description)
      .subscribe({
        next: (booking) => {
          this.snackBar.open('Group appointment booked successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadMyBookings();
          if (this.selectedInstructor) {
            this.loadAvailableAppointments(this.selectedInstructor.userId);
          }
          this.loadGroupCapacity(groupId);
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

  cancelBooking(bookingId: number): void {
    if (!bookingId) return;

    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason || reason.trim() === '') {
      this.snackBar.open('Cancellation reason is required', 'Close', {
        duration: 3000
      });
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

  cancelGroupBooking(bookingId: number, groupId: number): void {
    if (!confirm('⚠️ This will cancel the group appointment for ALL members. Are you sure?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason || reason.trim() === '') {
      this.snackBar.open('Cancellation reason is required', 'Close', { duration: 3000 });
      return;
    }

    this.schedulerService.cancelGroupForAll(bookingId, reason).subscribe({
      next: () => {
        this.snackBar.open('Group appointment cancelled for all members', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadMyBookings();
        if (this.selectedInstructor) {
          this.loadAvailableAppointments(this.selectedInstructor.userId);
        }
        this.loadGroupCapacity(groupId);
      },
      error: (error) => {
        console.error('Error cancelling group booking:', error);
        this.snackBar.open('Failed to cancel group booking', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
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