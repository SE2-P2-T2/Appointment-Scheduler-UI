import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-instructor-scheduler-component',
  imports: [MatCardModule, MatButtonModule, MatExpansionModule],
  templateUrl: './instructor-scheduler-component.html',
  styleUrl: './instructor-scheduler-component.scss',
})
export class InstructorSchedulerComponent {
  readonly panelOpenState = signal(false);
}
