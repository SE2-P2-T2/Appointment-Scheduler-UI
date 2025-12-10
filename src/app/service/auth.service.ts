import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { User, UserRole } from '../models/User';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  roleId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.userServiceUrl}/api/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          this.currentUserSubject.next(user);
          console.log('User loaded from localStorage:', user.email);
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('currentUser');
        }
      } else {
        console.log('No user found in localStorage');
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.get<User[]>(`${this.baseUrl}/getusers`).pipe(
      map(users => {
        const user = users.find(u => u.email === email);
        if (!user) {
          throw new Error('Invalid email or password');
        }
        return user;
      }),
      tap(user => {
        this.setCurrentUser(user);
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Invalid email or password'));
      })
    );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, userData).pipe(
      tap(user => {
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getUserRole(): number | null {
    const user = this.currentUserSubject.value;
    return user?.role?.roleId || null;
  }

  hasRole(roleId: number): boolean {
    return this.getUserRole() === roleId;
  }

  isInstructorOrTA(): boolean {
    const roleId = this.getUserRole();
    return roleId === UserRole.INSTRUCTOR || roleId === UserRole.TA;
  }

  isStudent(): boolean {
    return this.getUserRole() === UserRole.STUDENT;
  }

  setCurrentUser(user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
  }
}