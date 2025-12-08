import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SchedulerAppointment, BookingRequest, CancelBookingRequest } from '../models/Booking';
import { User } from '../models/User';
import { GroupMember } from '../models/GroupMember';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private baseUrl = `${environment.schedulerServiceUrl}/api/scheduler`;

  constructor(private http: HttpClient) {}
  
  bookIndividualAppointment(
    studentId: number,
    appointmentId: number,
    description: string
  ): Observable<SchedulerAppointment> {
    return this.http.post<SchedulerAppointment>(
      `${this.baseUrl}/book/individual`,
      { studentId, appointmentId, description }
    );
  }

  joinGroup(studentId: number, groupId: number): Observable<GroupMember> {
    return this.http.post<GroupMember>(
      `${this.baseUrl}/group/${groupId}/join`,
      { studentId }
    );
  }

  bookGroupForAll(
    studentId: number,
    groupId: number,
    description: string
  ): Observable<SchedulerAppointment> {
    return this.http.post<SchedulerAppointment>(
      `${this.baseUrl}/group/${groupId}/book`,
      { studentId, description }
    );
  }

  leaveGroup(studentId: number, groupId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/group/${groupId}/leave`,
      { params: { studentId: studentId.toString() } }
    );
  }

  isUserMemberOfGroup(studentId: number, groupId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.baseUrl}/group/${groupId}/is-member`,
      { params: { studentId: studentId.toString() } }
    );
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return this.http.get<GroupMember[]>(
      `${this.baseUrl}/group/${groupId}/members`
    );
  }

  getStudentBookings(studentId: number): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(
      `${this.baseUrl}/student/${studentId}`
    );
  }

  getAllBookings(): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(
      `${this.baseUrl}/bookings/all`
    );
  }

  cancelBooking(bookingId: number, reason: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/cancel/${bookingId}`,
      { reason }
    );
  }

  getInstructors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/instructors`);
  }


getIndividualBookings(): Observable<SchedulerAppointment[]> {
  return this.http.get<SchedulerAppointment[]>(
    `${this.baseUrl}/bookings/individual`
  );
}

getGroupBookings(): Observable<SchedulerAppointment[]> {
  return this.http.get<SchedulerAppointment[]>(
    `${this.baseUrl}/bookings/group`
  );
}

getBookingsByType(bookingType: string): Observable<SchedulerAppointment[]> {
  return this.http.get<SchedulerAppointment[]>(
    `${this.baseUrl}/bookings/type/${bookingType}`
  );
}

getBookingsByStatus(status: string): Observable<SchedulerAppointment[]> {
  return this.http.get<SchedulerAppointment[]>(
    `${this.baseUrl}/bookings/status/${status}`
  );
}
}