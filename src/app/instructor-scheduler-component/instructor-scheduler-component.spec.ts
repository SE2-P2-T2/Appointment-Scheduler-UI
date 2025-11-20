import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorSchedulerComponent } from './instructor-scheduler-component';

describe('InstructorSchedulerComponent', () => {
  let component: InstructorSchedulerComponent;
  let fixture: ComponentFixture<InstructorSchedulerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructorSchedulerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructorSchedulerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
