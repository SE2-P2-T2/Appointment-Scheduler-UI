import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NgIf } from '@angular/common';
import { AuthService } from './service/auth.service';
import { User } from './models/User';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    NgIf
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true
})
export class App implements OnInit {
  title = 'Appointment Scheduler';
  currentUser: User | null = null;
  showToolbar = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.updateToolbarVisibility();
    });


    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateToolbarVisibility();
    });


    this.updateToolbarVisibility();


    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  updateToolbarVisibility(): void {
    const currentRoute = this.router.url;
    

    this.showToolbar = this.currentUser !== null && 
                       (currentRoute.includes('/student-scheduler') || 
                        currentRoute.includes('/instructor-scheduler'));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  getRoleName(): string {
    if (!this.currentUser?.role) return '';
    return this.currentUser.role.roleName;
  }
}