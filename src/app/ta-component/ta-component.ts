import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';

import { GroupAppointment } from '../models/group-appointment';
import { Groups } from '../models/Groups';
import { GroupAppointmentService } from '../service/group-appointment.service';
import { GroupsService } from '../service/groups.service';
import { IndividualAppointment } from '../models/Individual-appointment';
import { IndividualAppointmentService } from '../service/individual-appointment.service';
import { SchedulerService } from '../service/scheduler.service';
import { UserService } from '../service/user.service';
import { AuthService } from '../service/auth.service';
import { SchedulerAppointment } from '../models/Booking';
import { User } from '../models/User';
import { GroupMember } from '../models/GroupMember';

interface BookedIndividualAppointment extends SchedulerAppointment {
  appointmentDetails?: IndividualAppointment;
  studentDetails?: User;
}

interface BookedGroupAppointment extends SchedulerAppointment {
  groupDetails?: Groups;
  studentDetails?: User;
}

@Component({
  selector: 'app-ta-component',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './ta-component.html',
  styleUrl: './ta-component.scss',
})
export class TaComponent implements OnInit {
  // Current TA's assigned professor ID - fetched from ta_instructors table
  assignedProfessorId: number | null = null;
  currentTaId: number = 1;
  assignedProfessor: User | null = null;
  loadingAssignedProfessor = true;

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
    private groupsService: GroupsService,
    private individualAppointmentService: IndividualAppointmentService,
    private schedulerService: SchedulerService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentTaId = currentUser.userId;
      console.log('Current TA:', currentUser);
    }

    // First load the assigned professor, then load appointments
    this.loadAssignedProfessor();
  }

  loadAssignedProfessor(): void {
    this.loadingAssignedProfessor = true;

    this.userService.getTAAssignedInstructor(this.currentTaId).subscribe({
      next: (professor) => {
        this.assignedProfessor = professor;
        this.assignedProfessorId = professor.userId;
        this.loadingAssignedProfessor = false;
        console.log('Assigned professor:', professor);

        this.loadBookedAppointments();
      },
      error: (error) => {
        console.error('Error loading assigned professor:', error);
        this.loadingAssignedProfessor = false;
        this.bookedError = 'Failed to load assigned instructor. Please contact administrator.';
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
      groupAppointments: this.groupsService.getAllGroups()
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

        if (appointment && appointment.instructorId === this.assignedProfessorId) {
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
    allGroups: Groups[]
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

      if (group && group.instructorId === this.assignedProfessorId) {
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

  getStudentName(booking: BookedIndividualAppointment | BookedGroupAppointment): string {
    if (booking.studentDetails) {
      return `${booking.studentDetails.firstName} ${booking.studentDetails.lastName}`;
    }
    return 'Unknown Student';
  }

  getStudentEmail(booking: BookedIndividualAppointment | BookedGroupAppointment): string {
    return booking.studentDetails?.email || 'N/A';
  }

  getProfessorName(): string {
    if (this.assignedProfessor) {
      return `${this.assignedProfessor.firstName} ${this.assignedProfessor.lastName}`;
    }
    return 'Loading...';
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
