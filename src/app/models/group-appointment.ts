// group-appointment.model.ts
export interface GroupAppointment {
  groupId?: number;
  groupName?: string;
  instructorId?: number;
  maxLimit?: number;
  startTime?: string;  
  endTime?: string;    
  description?: string;
  createdAt?: string; 
  updatedAt?: string;  
}