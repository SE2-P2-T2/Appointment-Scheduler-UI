import { Component, signal } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-scheduler',
  imports: [MatCardModule, MatButtonModule,MatExpansionModule],
  templateUrl: './scheduler.html',
  standalone: true,
  styleUrls: ['./scheduler.scss'],
})
export class Scheduler {
   readonly panelOpenState = signal(false);

}
