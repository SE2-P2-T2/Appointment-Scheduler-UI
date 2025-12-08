import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserRole } from '../models/User';
import { AuthService } from '../service/auth.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find(u => u.email === email);
        
        if (user) {
          this.authService.setCurrentUser(user);
          this.snackBar.open('Login successful!', 'Close', { duration: 3000 });

          if (user.role.roleId === UserRole.INSTRUCTOR) {
            this.router.navigate(['/instructor-scheduler']);
          } else if (user.role.roleId === UserRole.TA) {
            this.router.navigate(['/ta-dashboard']);
          } else if (user.role.roleId === UserRole.STUDENT) {
            this.router.navigate(['/student-scheduler']);
          } else if (user.role.roleId === UserRole.ADMIN) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          this.snackBar.open('Invalid email or password', 'Close', { duration: 3000 });
        }
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.snackBar.open('Login failed. Please try again.', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }
}