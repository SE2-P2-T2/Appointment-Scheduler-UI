import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupAppointment } from '../models/group-appointment';

@Injectable({
  providedIn: 'root'
})
export class GroupAppointmentSlotService {
  private baseUrl = `${environment.groupApiUrl}/groupappointments`;

  constructor(private httpClient: HttpClient) {}

  getAllGroupAppointments(): Observable<GroupAppointment[]> {
    return this.httpClient.get<GroupAppointment[]>(this.baseUrl);
  }

  getGroupAppointmentById(id: number): Observable<GroupAppointment> {
    return this.httpClient.get<GroupAppointment>(`${this.baseUrl}/${id}`);
  }

  getGroupAppointmentsByInstructor(instructorId: number): Observable<GroupAppointment[]> {
    return this.httpClient.get<GroupAppointment[]>(`${this.baseUrl}/by-instructor/${instructorId}`);
  }

  createGroupAppointment(appointment: GroupAppointment): Observable<GroupAppointment> {
    return this.httpClient.post<GroupAppointment>(this.baseUrl, appointment);
  }

  updateGroupAppointment(id: number, appointment: GroupAppointment): Observable<GroupAppointment> {
    return this.httpClient.put<GroupAppointment>(`${this.baseUrl}/${id}`, appointment);
  }

  deleteGroupAppointment(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
  }
}
