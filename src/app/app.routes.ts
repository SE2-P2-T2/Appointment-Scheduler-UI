import { Routes } from '@angular/router';
import { App } from './app';
import { Scheduler } from './scheduler-component/scheduler';

export const routes: Routes = [
  { path: '', component: App },
  { path: 'scheduler', component: Scheduler }
];
