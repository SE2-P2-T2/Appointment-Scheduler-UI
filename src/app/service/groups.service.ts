import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Groups } from '../models/Groups';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {
  private baseUrl = `${environment.groupApiUrl}/groups`;

  constructor(private httpClient: HttpClient) {}

  getAllGroups(): Observable<Groups[]> {
    return this.httpClient.get<Groups[]>(`${this.baseUrl}/getgroups`);
  }

  getGroupById(groupId: number): Observable<Groups> {
    return this.httpClient.get<Groups>(`${this.baseUrl}/${groupId}`);
  }

  getGroupsByInstructor(instructorId: number): Observable<Groups[]> {
    return this.httpClient.get<Groups[]>(`${this.baseUrl}/instructor/${instructorId}`);
  }

  createGroup(group: Groups): Observable<Groups> {
    return this.httpClient.post<Groups>(this.baseUrl, group);
  }

  deleteGroup(groupId: number): Observable<Groups> {
    return this.httpClient.delete<Groups>(`${this.baseUrl}/${groupId}`);
  }
}
