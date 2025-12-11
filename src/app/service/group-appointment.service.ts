import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { GroupAppointment } from '../models/group-appointment';
import { GroupMember } from '../models/GroupMember';

@Injectable({
  providedIn: 'root'
})
export class GroupAppointmentService {

  private baseUrl = `${environment.groupApiUrl}/groupappointments`;
  private schedulerBaseUrl = `${environment.schedulerServiceUrl}/api/scheduler`;

  constructor(private httpClient: HttpClient) {}

 getAllGroups(): Observable<GroupAppointment[]> {
    return this.httpClient.get<GroupAppointment[]>(this.baseUrl);
  }

  getGroupById(id: number): Observable<GroupAppointment> {
    return this.httpClient.get<GroupAppointment>(`${this.baseUrl}/${id}`);
  }

  createGroup(group: GroupAppointment): Observable<GroupAppointment> {
    return this.httpClient.post<GroupAppointment>(this.baseUrl, group);
  }

  updateGroup(id: number, group: GroupAppointment): Observable<GroupAppointment> {
    return this.httpClient.put<GroupAppointment>(`${this.baseUrl}/${id}`, group);
  }

  deleteGroup(id: number): Observable<GroupAppointment> {
    return this.httpClient.delete<GroupAppointment>(`${this.baseUrl}/${id}`);
  }

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return this.httpClient.get<GroupMember[]>(`${this.schedulerBaseUrl}/group/${groupId}/members`);
  }

  getGroupMemberCount(groupId: number): Observable<number> {
    return this.getGroupMembers(groupId).pipe(
      map((members: GroupMember[]) => members.length)
    );
  }

  canBookGroup(groupId: number): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.baseUrl}/${groupId}/can-book`);
  }

  getAppointmentsByInstructor(instructorId: number): Observable<GroupAppointment[]> {
    return this.httpClient.get<GroupAppointment[]>(`${this.baseUrl}/by-instructor/${instructorId}`);
  }

  updateAppointmentStatus(appointmentId: number, status: string): Observable<GroupAppointment> {
    return this.httpClient.put<GroupAppointment>(`${this.baseUrl}/${appointmentId}`, { status });
  }

  deleteGroupAppointment(appointmentId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${appointmentId}`);
  }
}