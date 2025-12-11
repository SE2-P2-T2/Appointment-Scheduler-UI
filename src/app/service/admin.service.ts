import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/User';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.userServiceUrl}/users`;
  constructor(private http: HttpClient) {}

  // -------- USERS --------
  getPendingStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/pending-users?role=3`);
  }

  getPendingInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/pending-users?role=1`);
  }

  getPendingTAs(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/admin/pending-users?role=2`);
  }

  approveUser(userId: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/admin/approve-user/${userId}`, {});
  }

  rejectUser(userId: number): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/admin/reject-user/${userId}`, {});
  }

  // -------- STUDENT-INSTRUCTOR MAPPINGS --------
  getPendingStudentInstructorMappings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/pending-student-instructor-mappings`);
  }

  approveStudentInstructorMapping(mappingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/approve-student-instructor-mapping/${mappingId}`, {});
  }

  rejectStudentInstructorMapping(mappingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/reject-student-instructor-mapping/${mappingId}`, {});
  }

  // -------- TA-INSTRUCTOR MAPPINGS --------
  getPendingTAInstructorMappings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/admin/pending-ta-instructor-mappings`);
  }

  approveTAInstructorMapping(mappingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/approve-ta-instructor-mapping/${mappingId}`, {});
  }

  rejectTAInstructorMapping(mappingId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/admin/reject-ta-instructor-mapping/${mappingId}`, {});
  }
}
