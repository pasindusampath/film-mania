/**
 * User role enum
 * Represents the role/authorization level of a user
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * Type guard to check if a value is a valid user role
 */
export function isUserRole(value: unknown): value is UserRole {
  return Object.values(UserRole).includes(value as UserRole);
}

