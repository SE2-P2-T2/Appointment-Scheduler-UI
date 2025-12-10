import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { User, UserRole } from '../models/User';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register implements OnInit {
  registerForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirmPassword = true;
  professors: User[] = [];
  loadingProfessors = false;
  showInstructorSelection = false;

  roles = [
    { value: UserRole.INSTRUCTOR, label: 'Instructor' },
    { value: UserRole.TA, label: 'Teaching Assistant' },
    { value: UserRole.STUDENT, label: 'Student' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: [''],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      roleId: ['', [Validators.required]],
      instructorId: ['']
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Watch for role changes
    this.registerForm.get('roleId')?.valueChanges.subscribe(roleId => {
      this.onRoleChange(roleId);
    });
  }

  onRoleChange(roleId: number): void {
    const instructorIdControl = this.registerForm.get('instructorId');

    if (roleId === UserRole.STUDENT) {

      this.showInstructorSelection = true;
      instructorIdControl?.setValidators([Validators.required]);
      instructorIdControl?.updateValueAndValidity();

      if (this.professors.length === 0) {
        this.loadProfessors();
      }
    } else {
   
      this.showInstructorSelection = false;
      instructorIdControl?.clearValidators();
      instructorIdControl?.setValue('');
      instructorIdControl?.updateValueAndValidity();
    }
  }

  loadProfessors(): void {
    this.loadingProfessors = true;
    this.userService.getProfessors().subscribe({
      next: (data) => {
        this.professors = data;
        this.loadingProfessors = false;
      },
      error: (error) => {
        console.error('Error loading professors:', error);
        this.snackBar.open('Failed to load professors', 'Close', { duration: 3000 });
        this.loadingProfessors = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const formValue = this.registerForm.value;
    const { confirmPassword, instructorId, ...userData } = formValue;

    this.userService.createUser(userData).subscribe({
      next: (user) => {
        if (formValue.roleId === UserRole.STUDENT && instructorId) {
          this.userService.createStudentInstructorMapping(user.userId, instructorId).subscribe({
            next: () => {
              this.snackBar.open('Registration successful! Your instructor request is pending approval.', 'Close', {
                duration: 4000
              });
              this.router.navigate(['/login']);
              this.loading = false;
            },
            error: (error: any) => {
              console.error('Error creating instructor mapping:', error);
              this.snackBar.open('Registration successful, but failed to assign instructor. Please contact admin.', 'Close', {
                duration: 5000
              });
              this.router.navigate(['/login']);
              this.loading = false;
            }
          });
        } else {
          this.snackBar.open('Registration successful! Please login.', 'Close', {
            duration: 3000
          });
          this.router.navigate(['/login']);
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        const errorMsg = error.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMsg, 'Close', { duration: 4000 });
        this.loading = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}