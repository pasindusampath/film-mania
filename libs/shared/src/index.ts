/**
 * Shared library - Barrel exports
 * Central export point for all shared types, DTOs, interfaces, and utilities
 */

// Constants
export const API_VERSION = '1.0.0';

// Barrel exports for types
export * from './interfaces';
export * from './dtos';
export * from './enums';

// Utility functions
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const sleep = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));
