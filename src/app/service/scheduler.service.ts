import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { SchedulerAppointment, BookingRequest, CancelBookingRequest } from '../models/Booking';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class SchedulerService {
  private baseUrl = `${environment.schedulerServiceUrl}/api/scheduler`;

  constructor(private http: HttpClient) {}

  getAllInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.userServiceUrl}/api/users/getProfessors`);
  }

  getInstructorById(instructorId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/instructors/${instructorId}`);
  }

  getStudentById(studentId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/students/${studentId}`);
  }

  bookIndividualAppointment(studentId: number, appointmentId: number, description: string): Observable<SchedulerAppointment> {
    const request: BookingRequest = {
      studentId,
      appointmentId,
      status:'confirmed',
      description
    };
    return this.http.post<SchedulerAppointment>(`${this.baseUrl}/book/individual`, request);
  }


  bookGroupAppointment(studentId: number, groupId: number, description: string): Observable<SchedulerAppointment> {
    const request: BookingRequest = {
      studentId,
      groupId,
      status:'confirmed',
      description
    };
    return this.http.post<SchedulerAppointment>(`${this.baseUrl}/book/group`, request);
  }


  cancelBooking(bookingId: number, reason: string): Observable<void> {
    const request: CancelBookingRequest = { reason };
    return this.http.put<void>(`${this.baseUrl}/cancel/${bookingId}`, request);
  }


  getStudentBookings(studentId: number): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/student/${studentId}`);
  }


  cancelGroupForAll(bookingId: number, reason: string): Observable<void> {
    return this.http.put<void>(
      `${this.baseUrl}/cancel/group/${bookingId}`,
      { reason }
    );
  }


  getIndividualBookingsByInstructor(instructorId: number): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/individual/instructor/${instructorId}`);
  }

 
  getGroupBookingsByInstructor(instructorId: number): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/group/instructor/${instructorId}`);
  }


  getIndividualBookings(): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/individual`);
  }


  getGroupBookings(): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/group`);
  }


  getAllBookings(): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/all`);
  }


  getBookingsByType(bookingType: string): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/type/${bookingType}`);
  }


  getBookingsByStatus(status: string): Observable<SchedulerAppointment[]> {
    return this.http.get<SchedulerAppointment[]>(`${this.baseUrl}/bookings/status/${status}`);
  }
}