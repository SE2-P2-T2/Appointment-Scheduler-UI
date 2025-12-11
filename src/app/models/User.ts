export interface Role {
  roleId: number;
  roleName: string;
}

export interface User {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  instructorName?: string;
}

export enum UserRole {
  INSTRUCTOR = 1,
  TA = 2,
  STUDENT = 3,
  ADMIN = 4
}