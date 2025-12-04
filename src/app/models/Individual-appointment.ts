export interface IndividualAppointment {
  appointmentId?: number;
  instructorId: number;
  appointmentDate: string;
  startTime: string; 
  endTime: string;
  location?: string;
  description?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}