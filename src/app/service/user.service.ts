import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.userServiceUrl}/api/users`;

  constructor(private http: HttpClient) {}


  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getusers`);
  }


  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`);
  }


  createUser(userData: any): Observable<User> {
    return this.http.post<User>(this.baseUrl, userData);
  }


  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${userId}`);
  }


  getInstructors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getusers`);
  }

  getProfessors(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/getProfessors`);
  }

  getTAAssignedInstructor(taId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/ta/${taId}/assigned-instructor`);
  }

  createStudentInstructorMapping(studentId: number, instructorId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/student-instructor-mapping`, {
      studentId,
      instructorId,
      status: 'pending'
    });
  }
}