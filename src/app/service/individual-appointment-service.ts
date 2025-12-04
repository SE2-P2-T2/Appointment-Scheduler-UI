// appointment.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupAppointment } from '../models/group-appointment';
import { IndividualAppointment } from '../models/Individual-appointment';

@Injectable({
  providedIn: 'root' 
})
export class IndividualAppointmentService {

  private baseUrl = `${environment.individualApiUrl}/appointments`;

  constructor(private httpClient: HttpClient) {
  }

  // Individual Appointments
  getAllIndividualAppointments(): Observable<IndividualAppointment[]> {
    return this.httpClient.get<IndividualAppointment[]>(`${this.baseUrl}/individual`);
  }

  getIndividualAppointmentsByInstructor(instructorId: number): Observable<IndividualAppointment[]> {
    return this.httpClient.get<IndividualAppointment[]>(`${this.baseUrl}/individual/instructor/${instructorId}`);
  }

  createIndividualAppointment(appointment: IndividualAppointment): Observable<IndividualAppointment> {
    return this.httpClient.post<IndividualAppointment>(`${this.baseUrl}/individual`, appointment);
  }

  deleteIndividualAppointment(appointmentId: number): Observable<IndividualAppointment[]> {
    return this.httpClient.delete<IndividualAppointment[]>(`${this.baseUrl}/individual/${appointmentId}`);
  }
}