import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAppointmentDialog } from './create-appointment-dialog';

describe('CreateAppointmentDialog', () => {
  let component: CreateAppointmentDialog;
  let fixture: ComponentFixture<CreateAppointmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateAppointmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateAppointmentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
