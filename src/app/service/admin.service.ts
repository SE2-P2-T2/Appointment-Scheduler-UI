import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role_id: string;
  signup_status: string; // Pending, Approved, etc.
}

export interface StudentInstructorRequest {
  id: number;
  student_id: number;
  student_first_name: string;
  student_last_name: string;
  instructor_id: number;
  instructor_first_name: string;
  instructor_last_name: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor() {}

  getPendingUsers(): Observable<User[]> {
    const users: User[] = [
      { user_id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role_id: 'Student', signup_status: 'Pending' },
      { user_id: 2, first_name: 'Aditi', last_name: 'Phadke', email: 'aditi@example.com', role_id: 'Instructor', signup_status: 'Pending' }
    ];
    return of(users);
  }

  getStudentInstructorRequests(): Observable<StudentInstructorRequest[]> {
    const requests: StudentInstructorRequest[] = [
      { id: 101, student_id: 1, student_first_name: 'John', student_last_name: 'Doe', instructor_id: 2, instructor_first_name: 'Aditi', instructor_last_name: 'Phadke', created_at: '2025-12-07T10:30:00' },
      { id: 102, student_id: 3, student_first_name: 'Alice', student_last_name: 'Brown', instructor_id: 4, instructor_first_name: 'Raj', instructor_last_name: 'Kumar', created_at: '2025-12-07T11:00:00' }
    ];
    return of(requests);
  }

  // Get all users (pending + active)
  getAllUsers(): Observable<User[]> {
    const users: User[] = [
      // Pending users
      { user_id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com', role_id: 'Student', signup_status: 'Pending' },
      { user_id: 2, first_name: 'Aditi', last_name: 'Phadke', email: 'aditi@example.com', role_id: 'Instructor', signup_status: 'Pending' },
      // Approved/active users
      { user_id: 3, first_name: 'Alice', last_name: 'Brown', email: 'alice@example.com', role_id: 'Student', signup_status: 'Approved' },
      { user_id: 4, first_name: 'Raj', last_name: 'Kumar', email: 'raj@example.com', role_id: 'Instructor', signup_status: 'Approved' },
      { user_id: 5, first_name: 'Emma', last_name: 'Watson', email: 'emma@example.com', role_id: 'TA', signup_status: 'Approved' }
    ];
    return of(users);
  }

  approveUser(userId: number): void {
    console.log(`Approved user with ID ${userId}`);
  }

  rejectUser(userId: number): void {
    console.log(`Rejected user with ID ${userId}`);
  }

  approveStudentInstructor(requestId: number): void {
    console.log(`Approved student-instructor request ${requestId}`);
  }

  rejectStudentInstructor(requestId: number): void {
    console.log(`Rejected student-instructor request ${requestId}`);
  }
}
