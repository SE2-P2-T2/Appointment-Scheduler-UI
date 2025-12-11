// appointment.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  getAllIndividualAppointments(): Observable<IndividualAppointment[]> {
    return this.httpClient.get<IndividualAppointment[]>(`${this.baseUrl}/individual`);
  }

  getIndividualAppointmentsByInstructor(instructorId: number): Observable<IndividualAppointment[]> {
    return this.getAllIndividualAppointments().pipe(
      map((appointments: any) => {
        const appointmentArray = Array.isArray(appointments) ? appointments : [];
        return appointmentArray.filter(apt => apt.instructorId === instructorId);
      })
    );
  }

  createIndividualAppointment(appointment: IndividualAppointment): Observable<IndividualAppointment> {
    return this.httpClient.post<IndividualAppointment>(`${this.baseUrl}/individual`, appointment);
  }

  deleteIndividualAppointment(appointmentId: number): Observable<IndividualAppointment[]> {
    return this.httpClient.delete<IndividualAppointment[]>(`${this.baseUrl}/individual/${appointmentId}`);
  }

  updateAppointmentStatus(appointmentId: number, status: string): Observable<IndividualAppointment> {
    return this.httpClient.put<IndividualAppointment>(`${this.baseUrl}/individual/${appointmentId}`, { status });
  }
}