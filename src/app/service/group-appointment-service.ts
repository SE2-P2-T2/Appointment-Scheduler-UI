// appointment.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupAppointment } from '../models/group-appointment';

@Injectable({
  providedIn: 'root' 
})
export class GroupAppointmentService {

  private baseUrl = `${environment.groupApiUrl}/groups`;

  constructor(private httpClient: HttpClient) {
    // No need to reassign httpClient, it's already injected
  }

  // Group Service Methods
  getAllGroups(): Observable<GroupAppointment[]> {
    return this.httpClient.get<GroupAppointment[]>(`${this.baseUrl}/getgroups`);
  }

  getGroupById(id: number): Observable<GroupAppointment> {
    return this.httpClient.get<GroupAppointment>(`${this.baseUrl}/${id}`);
  }

  createGroup(group: GroupAppointment): Observable<GroupAppointment> {
    return this.httpClient.post<GroupAppointment>(this.baseUrl, group);
  }

  deleteGroup(id: number): Observable<GroupAppointment> {
    return this.httpClient.delete<GroupAppointment>(`${this.baseUrl}/${id}`);
  }
}