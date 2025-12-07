import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { GroupAppointment } from '../models/group-appointment';
import { GroupAppointmentService } from '../service/group-appointment.service';
import { IndividualAppointment } from '../models/Individual-appointment';
import { IndividualAppointmentService } from '../service/individual-appointment.service';
import { SchedulerService } from '../service/scheduler.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { SchedulerAppointment } from '../models/Booking';
import { User } from '../models/User';
import { AppointmentDialogResult, CreateAppointmentDialogComponent } from '../create-appointment-dialog/create-appointment-dialog';
import { MatDialog } from '@angular/material/dialog';
import { GroupMember } from '../models/GroupMember';

interface BookedIndividualAppointment extends SchedulerAppointment {
  appointmentDetails?: IndividualAppointment;
  studentDetails?: User;
}

interface BookedGroupAppointment extends SchedulerAppointment {
  groupDetails?: GroupAppointment;
  studentDetails?: User;
}

@Component({
  selector: 'app-instructor-scheduler-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './instructor-scheduler-component.html',
  styleUrl: './instructor-scheduler-component.scss',
})
export class InstructorSchedulerComponent implements OnInit {
  readonly panelOpenState = signal(false);
  readonly dialog = inject(MatDialog);

  currentInstructorId: number = 1;

  groupAppointments: GroupAppointment[] = [];
  groupLoading = false;
  groupError: string | null = null;

  individualAppointments: IndividualAppointment[] = [];
  individualLoading = false;
  individualError: string | null = null;

  bookedGroupAppointments: BookedGroupAppointment[] = [];
  bookedIndividualAppointments: BookedIndividualAppointment[] = [];
  bookedLoading = false;
  bookedError: string | null = null;

  showingGroupMembers: { [key: number]: boolean } = {};
  groupMembers: { [key: number]: GroupMember[] } = {};
  groupMemberCounts: { [key: number]: number } = {};
  loadingGroupMembers: { [key: number]: boolean } = {};

  constructor(
    private groupAppointmentService: GroupAppointmentService,
    private individualAppointmentService: IndividualAppointmentService,
    private schedulerService: SchedulerService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentInstructorId = currentUser.userId;
    }

    this.loadGroupAppointments();
    this.loadIndividualAppointments();
    this.loadBookedAppointments();
  }


  loadGroupAppointments(): void {
    this.groupLoading = true;
    this.groupError = null;

    this.groupAppointmentService.getAllGroups().subscribe({
      next: (data) => {
        this.groupAppointments = data.filter(
          apt => apt.instructorId === this.currentInstructorId && 
                 apt.status !== 'cancelled' && 
                 apt.status !== 'booked'
        );
        this.groupLoading = false;
        console.log('Loaded group appointments for instructor:', this.groupAppointments);
      },
      error: (error) => {
        this.groupError = 'Failed to load group appointments';
        this.groupLoading = false;
        console.error('Error loading group appointments:', error);
      }
    });
  }

  loadIndividualAppointments(): void {
    this.individualLoading = true;
    this.individualError = null;

    this.individualAppointmentService.getAllIndividualAppointments().subscribe({
      next: (data) => {
        this.individualAppointments = data.filter(
          apt => apt.instructorId === this.currentInstructorId && 
                 apt.status !== 'cancelled' && 
                 apt.status !== 'booked'
        );
        this.individualLoading = false;
        console.log('Loaded individual appointments for instructor:', this.individualAppointments);
      },
      error: (error) => {
        this.individualError = 'Failed to load individual appointments';
        this.individualLoading = false;
        console.error('Error loading individual appointments:', error);
      }
    });
  }


  loadBookedAppointments(): void {
    this.bookedLoading = true;
    this.bookedError = null;

    forkJoin({
      individualBookings: this.schedulerService.getIndividualBookings(),
      groupBookings: this.schedulerService.getGroupBookings(),
      individualAppointments: this.individualAppointmentService.getAllIndividualAppointments(),
      groupAppointments: this.groupAppointmentService.getAllGroups()
    }).subscribe({
      next: (data) => {
        this.processIndividualBookings(
          data.individualBookings,
          data.individualAppointments
        );
        this.processGroupBookings(
          data.groupBookings,
          data.groupAppointments
        );
        this.bookedLoading = false;
        
        this.loadGroupMemberCounts();
      },
      error: (error) => {
        this.bookedError = 'Failed to load booked appointments';
        this.bookedLoading = false;
        console.error('Error loading booked appointments:', error);
      }
    });
  }

  processIndividualBookings(
    bookings: SchedulerAppointment[],
    allAppointments: IndividualAppointment[]
  ): void {
    const enrichedBookings: BookedIndividualAppointment[] = [];

    bookings.forEach(booking => {
      if (booking.appointmentId) {
        const appointment = allAppointments.find(
          a => a.appointmentId === booking.appointmentId
        );

        if (appointment && appointment.instructorId === this.currentInstructorId) {
          this.userService.getUserById(booking.studentId).subscribe({
            next: (student) => {
              enrichedBookings.push({
                ...booking,
                appointmentDetails: appointment,
                studentDetails: student
              });
              this.bookedIndividualAppointments = [...enrichedBookings];
            },
            error: (error) => {
              console.error('Error loading student details:', error);
            }
          });
        }
      }
    });
  }

processGroupBookings(
  bookings: SchedulerAppointment[],
  allGroups: GroupAppointment[]
): void {
  const enrichedBookings: BookedGroupAppointment[] = [];
  const groupedByGroupId = new Map<number, SchedulerAppointment[]>();
  
  bookings.forEach(booking => {
    if (booking.groupId) {
      const groupId = booking.groupId;
      if (!groupedByGroupId.has(groupId)) {
        groupedByGroupId.set(groupId, []);
      }
      groupedByGroupId.get(groupId)!.push(booking);
    }
  });
  
  console.log('Grouped bookings by groupId:', groupedByGroupId);
  
  groupedByGroupId.forEach((groupBookings, groupId) => {
    const sortedBookings = groupBookings.sort((a, b) => {
      const dateA = new Date(a.bookedAt || 0).getTime();
      const dateB = new Date(b.bookedAt || 0).getTime();
      return dateA - dateB;
    });
    
    const firstBooking = sortedBookings[0];
    
    const group = allGroups.find(g => g.groupId === groupId);
    
    if (group && group.instructorId === this.currentInstructorId) {
      this.userService.getUserById(firstBooking.studentId).subscribe({
        next: (student) => {
          enrichedBookings.push({
            ...firstBooking,
            groupDetails: group,
            studentDetails: student
          });
          
          this.bookedGroupAppointments = [...enrichedBookings];
          
          console.log('Added group booking:', {
            groupId,
            firstBooker: student.firstName + ' ' + student.lastName,
            totalMembers: sortedBookings.length
          });
        },
        error: (error) => {
          console.error('Error loading student details:', error);
        }
      });
    }
  });
}

  loadGroupMemberCounts(): void {
    const uniqueGroupIds = [...new Set(this.bookedGroupAppointments
      .map(b => b.groupId)
      .filter((id): id is number => id !== null && id !== undefined))];

    uniqueGroupIds.forEach(groupId => {
      this.groupAppointmentService.getGroupMemberCount(groupId).subscribe({
        next: (count) => {
          this.groupMemberCounts[groupId] = count;
        },
        error: (error) => {
          console.error(`Error loading member count for group ${groupId}:`, error);
        }
      });
    });
  }

toggleGroupMembers(groupId: number): void {
  if (this.showingGroupMembers[groupId]) {
    this.showingGroupMembers[groupId] = false;
    return;
  }

  this.loadingGroupMembers[groupId] = true;
  this.groupAppointmentService.getGroupMembers(groupId).subscribe({
    next: (members) => {
      this.groupMembers[groupId] = Array.isArray(members) ? members : [];
      this.showingGroupMembers[groupId] = true;
      this.loadingGroupMembers[groupId] = false;
      console.log(`Loaded ${this.groupMembers[groupId].length} members for group ${groupId}`, members);
    },
    error: (error) => {
      console.error(`Error loading members for group ${groupId}:`, error);
      this.loadingGroupMembers[groupId] = false;
      this.groupMembers[groupId] = [];
    }
  });
}

  createGroupAppointment(appointment: GroupAppointment): void {
    appointment.instructorId = this.currentInstructorId;

    this.groupAppointmentService.createGroup(appointment).subscribe({
      next: (data) => {
        console.log('Group appointment created successfully:', data);
        this.loadGroupAppointments();
      },
      error: (error) => {
        this.groupError = 'Failed to create group appointment';
        console.error('Error creating group appointment:', error);
      }
    });
  }

  createIndividualAppointment(appointment: IndividualAppointment): void {
    appointment.instructorId = this.currentInstructorId;

    this.individualAppointmentService.createIndividualAppointment(appointment).subscribe({
      next: (data) => {
        console.log('Individual appointment created successfully:', data);
        this.loadIndividualAppointments();
      },
      error: (error) => {
        this.individualError = 'Failed to create individual appointment';
        console.error('Error creating individual appointment:', error);
      }
    });
  }

  deleteGroupAppointment(id: number | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this group appointment?')) {
      this.groupAppointmentService.deleteGroup(id).subscribe({
        next: (data) => {
          if (data) {
            console.log('Group appointment deleted successfully');
            this.loadGroupAppointments();
          }
        },
        error: (error) => {
          this.groupError = 'Failed to delete group appointment';
          console.error('Error deleting group appointment:', error);
        }
      });
    }
  }

  deleteIndividualAppointment(appointmentId: number | undefined): void {
    if (!appointmentId) return;

    if (confirm('Are you sure you want to delete this individual appointment?')) {
      this.individualAppointmentService.deleteIndividualAppointment(appointmentId).subscribe({
        next: (data) => {
          if (data) {
            console.log('Individual appointment deleted successfully');
            this.loadIndividualAppointments();
          }
        },
        error: (error) => {
          this.individualError = 'Failed to delete individual appointment';
          console.error('Error deleting individual appointment:', error);
        }
      });
    }
  }

  openCreateAppointmentDialog(): void {
    const dialogRef = this.dialog.open(CreateAppointmentDialogComponent, {
      width: '600px',
      data: { instructorId: this.currentInstructorId },
    });

    dialogRef.afterClosed().subscribe((result: AppointmentDialogResult | undefined) => {
      if (result) {
        if (result.type === 'individual') {
          console.log('Creating individual appointment:', result.data);
          this.createIndividualAppointment(result.data as IndividualAppointment);
        } else if (result.type === 'group') {
          console.log('Creating group appointment:', result.data);
          this.createGroupAppointment(result.data as GroupAppointment);
        }
      }
    });
  }

  getStudentName(booking: BookedIndividualAppointment | BookedGroupAppointment): string {
    if (booking.studentDetails) {
      return `${booking.studentDetails.firstName} ${booking.studentDetails.lastName}`;
    }
    return 'Unknown Student';
  }

  getStudentEmail(booking: BookedIndividualAppointment | BookedGroupAppointment): string {
    return booking.studentDetails?.email || 'N/A';
  }

isArray(value: any): boolean {
  return Array.isArray(value);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}