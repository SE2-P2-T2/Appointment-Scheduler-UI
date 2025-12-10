export interface SchedulerAppointment {
  bookingId?: number;
  appointmentId?: number;   
  groupAppointmentId?: number;     
  studentId: number;
  groupId?: number;                
  bookingType: 'individual' | 'group';
  bookedAt?: string;
  status: string;
  notes?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface BookingRequest {
  studentId: number;
  appointmentId?: number;
  groupId?: number;
  status?: string;
  description?: string;
}

export interface CancelBookingRequest {
  reason: string;
}