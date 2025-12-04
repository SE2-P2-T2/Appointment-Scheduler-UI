import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'; 
import { MatIconModule } from '@angular/material/icon';
import { Role } from './enums/roles.enum';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatCardModule, MatButtonModule,MatButtonModule, MatMenuModule,MatToolbarModule,MatIconModule
    ,NgIf
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  standalone: true
})
export class App {


  protected readonly title = signal('appointment-scheduler-ui');
  role = Role.Instructor;
  //role = Role.Student

  constructor(private router: Router) {}
  
  ngOnInit() {
  if (this.role === Role.Student) {
    this.router.navigate(['/student-scheduler']);
  } else {
    this.router.navigate(['/instructor-scheduler']);
  }
}
}
