import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { GroupAppointment } from '../models/group-appointment';
import { GroupMember } from '../models/GroupMember';

@Injectable({
  providedIn: 'root' 
})
export class GroupAppointmentService {

  private baseUrl = `${environment.groupApiUrl}/groups`;
  private baseGroupMemberUrl = `${environment.groupApiUrl}/groupmembers`;

  constructor(private httpClient: HttpClient) {}

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

  getGroupMembers(groupId: number): Observable<GroupMember[]> {
    return this.httpClient.get<GroupMember[]>(`${this.baseGroupMemberUrl}/group/${groupId}`);
  }

  getGroupMemberCount(groupId: number): Observable<number> {
    return this.httpClient.get<number>(`${this.baseGroupMemberUrl}/group/${groupId}/count`);
  }
}