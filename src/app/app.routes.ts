import { Routes } from '@angular/router';
import { App } from './app';
import { Scheduler } from './scheduler-component/scheduler';
import { InstructorSchedulerComponent } from './instructor-scheduler-component/instructor-scheduler-component';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'student-scheduler', component: Scheduler },
  { path: 'instructor-scheduler', component: InstructorSchedulerComponent }
];
;
