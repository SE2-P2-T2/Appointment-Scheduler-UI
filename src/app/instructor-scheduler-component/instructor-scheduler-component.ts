// instructor-scheduler-component.ts
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { GroupAppointment } from '../models/group-appointment';
import { GroupAppointmentService } from '../service/group-appointment-service';
import { IndividualAppointment } from '../models/Individual-appointment';
import { IndividualAppointmentService } from '../service/individual-appointment-service';
import { AppointmentDialogResult, CreateAppointmentDialogComponent } from '../create-appointment-dialog/create-appointment-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-instructor-scheduler-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule, 
    MatButtonModule, 
    MatExpansionModule
  ],
  templateUrl: './instructor-scheduler-component.html',
  styleUrl: './instructor-scheduler-component.scss',
})
export class InstructorSchedulerComponent implements OnInit {
  readonly panelOpenState = signal(false);
  readonly dialog = inject(MatDialog);
  
  groupAppointments: GroupAppointment[] = [];
  groupLoading = false;
  groupError: string | null = null;

  individualAppointments: IndividualAppointment[] = [];
  individualLoading = false;
  individualError: string | null = null;

  // Sample Data for booked appointments
  bookedGroupAppointments = [
    {
      groupId: 1,
      groupName: 'Software Engineering Team A',
      instructorId: 101,
      startTime: '10:00:00',
      endTime: '11:00:00',
      maxLimit: 5,
      currentParticipants: 4,
      description: 'Sprint Planning Session',
      bookedBy: 'John Doe',
      bookedAt: '2025-12-01T14:30:00Z',
      status: 'BOOKED'
    },
    {
      groupId: 2,
      groupName: 'Data Science Team B',
      instructorId: 101,
      startTime: '14:00:00',
      endTime: '15:30:00',
      maxLimit: 6,
      currentParticipants: 6,
      description: 'Model Review and Discussion',
      bookedBy: 'Jane Smith',
      bookedAt: '2025-12-02T09:15:00Z',
      status: 'BOOKED'
    },
    {
      groupId: 3,
      groupName: 'Web Development Group C',
      instructorId: 101,
      startTime: '16:00:00',
      endTime: '17:00:00',
      maxLimit: 4,
      currentParticipants: 3,
      description: 'Frontend Architecture Discussion',
      bookedBy: 'Mike Johnson',
      bookedAt: '2025-12-03T11:20:00Z',
      status: 'BOOKED'
    }
  ];

  bookedIndividualAppointments = [
    {
      appointmentId: 101,
      instructorId: 101,
      appointmentDate: '2025-12-15',
      startTime: '09:00:00',
      endTime: '10:00:00',
      location: 'Room 301',
      description: 'Thesis Discussion',
      studentName: 'Alice Williams',
      studentEmail: 'alice.williams@example.com',
      bookedAt: '2025-11-28T10:30:00Z',
      status: 'BOOKED'
    },
    {
      appointmentId: 102,
      instructorId: 101,
      appointmentDate: '2025-12-16',
      startTime: '11:00:00',
      endTime: '12:00:00',
      location: 'Room 205',
      description: 'Project Guidance',
      studentName: 'Bob Anderson',
      studentEmail: 'bob.anderson@example.com',
      bookedAt: '2025-11-29T15:45:00Z',
      status: 'BOOKED'
    },
    {
      appointmentId: 103,
      instructorId: 101,
      appointmentDate: '2025-12-17',
      startTime: '13:00:00',
      endTime: '14:00:00',
      location: 'Room 402',
      description: 'Code Review Session',
      studentName: 'Carol Martinez',
      studentEmail: 'carol.martinez@example.com',
      bookedAt: '2025-11-30T08:00:00Z',
      status: 'BOOKED'
    },
    {
      appointmentId: 104,
      instructorId: 101,
      appointmentDate: '2025-12-18',
      startTime: '15:00:00',
      endTime: '16:00:00',
      location: 'Room 101',
      description: 'Research Methodology Consultation',
      studentName: 'David Lee',
      studentEmail: 'david.lee@example.com',
      bookedAt: '2025-12-01T12:30:00Z',
      status: 'BOOKED'
    }
  ];


  constructor(private groupAppointmentService: GroupAppointmentService, private individualAppointmentService: IndividualAppointmentService) {}
  ngOnInit(): void {
    this.loadGroupAppointments();
    this.loadIndividualAppointments();
  }

  loadGroupAppointments(): void {
    this.groupLoading = true;
    this.groupError = null;

    this.groupAppointmentService.getAllGroups().subscribe({
      next: (data) => {
        this.groupAppointments = data;
        this.groupLoading = false;
        console.log('Loaded group appointments:', data);
      },
      error: (error) => {
        this.groupError = 'Failed to load group appointments';
        this.groupLoading = false;
        console.error('Error loading group appointments:', error);
      }
    });
  }

    createGroupAppointment(appointment: GroupAppointment): void {
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

  deleteGroupAppointment(id: number | undefined): void {
    if (!id) return;
    console.log('Attempting to delete group appointment with id:', id);

    if (confirm('Are you sure you want to delete this group appointment?')) {
      this.groupAppointmentService.deleteGroup(id).subscribe({
        next: (data) => {
          if (data)
          {
          console.log('Group appointment deleted successfully');
          this.loadGroupAppointments(); // Reload the list
          }
        },
        error: (error) => {
          this.groupError = 'Failed to delete group appointment';
          console.error('Error deleting group appointment:', error);
        }
      });
    }
  }
loadIndividualAppointments(): void {
    this.individualLoading = true;
    this.individualError = null;

    this.individualAppointmentService.getAllIndividualAppointments().subscribe({
      next: (data) => {
        this.individualAppointments = data;
        this.individualLoading = false;
        console.log('Loaded individual appointments:', data);
      },
      error: (error) => {
        this.individualError = 'Failed to load individual appointments';
        this.individualLoading = false;
        console.error('Error loading individual appointments:', error);
      }
    });
  }

  createIndividualAppointment(appointment: IndividualAppointment): void {
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

  deleteIndividualAppointment(appointmentId: number | undefined): void {
    if (!appointmentId) return;
    
    if (confirm('Are you sure you want to delete this individual appointment?')) {
      this.individualAppointmentService.deleteIndividualAppointment(appointmentId).subscribe({
        next: (data) => {
          if (data)
          {
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
      data: { instructorId: 1 },
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