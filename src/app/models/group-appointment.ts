export interface GroupAppointment {
  groupId?: number;
  instructorId?: number;
  groupName?: string;
  startTime?: string;
  endTime?: string;
  maxLimit?: number;
  description?: string;
  status?: string;
  createdAt?: string;
  isBooked?: boolean;
  bookedAppointmentId?: number;
  bookedByUserId?: number;
  bookedAt?: string;
}