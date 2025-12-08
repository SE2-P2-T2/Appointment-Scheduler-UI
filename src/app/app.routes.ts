import { Routes } from '@angular/router';
import { Scheduler } from './scheduler-component/scheduler';
import { Login } from './login/login';
import { Register } from './register/register';
import { AuthGuard } from './service/auth.guard';
import { InstructorSchedulerComponent } from './instructor-scheduler-component/instructor-scheduler-component';
import { GroupManagementComponent } from './group-management.component/group-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { 
    path: 'student-scheduler', 
    component: Scheduler,
    canActivate: [AuthGuard]
  },
    { 
    path: 'group-management', 
    component: GroupManagementComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'instructor-scheduler', 
    component: InstructorSchedulerComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];