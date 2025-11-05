import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  type: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  isEmail?: boolean;
  isNumeric?: boolean;
  custom?: (value: any) => boolean;
}

interface ValidationSchema {
  body?: Record<string, ValidationRule>;
  params?: Record<string, ValidationRule>;
  query?: Record<string, ValidationRule>;
}

/**
 * Simple validation middleware
 * Used for basic validation when DTOs are not needed
 */
export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    // Validate body
    if (schema.body) {
      for (const [field, rule] of Object.entries(schema.body)) {
        const value = req.body[field];

        if (rule.required && (value === undefined || value === null || value === '')) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} is required`);
          continue;
        }

        if (value === undefined || value === null) {
          continue; // Skip validation if field is not required and not provided
        }

        if (rule.type && typeof value !== rule.type) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} must be of type ${rule.type}`);
        }

        if (rule.isEmail && typeof value === 'string') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            if (!errors[field]) errors[field] = [];
            errors[field].push(`${field} must be a valid email`);
          }
        }

        if (rule.minLength && typeof value === 'string' && value.length < rule.minLength) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} must be at least ${rule.minLength} characters`);
        }

        if (rule.maxLength && typeof value === 'string' && value.length > rule.maxLength) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} must be at most ${rule.maxLength} characters`);
        }

        if (rule.custom && !rule.custom(value)) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} is invalid`);
        }
      }
    }

    // Validate params
    if (schema.params) {
      for (const [field, rule] of Object.entries(schema.params)) {
        const value = req.params[field];

        if (rule.required && (value === undefined || value === null || value === '')) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} is required`);
          continue;
        }

        if (value !== undefined && rule.type && typeof value !== rule.type) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} must be of type ${rule.type}`);
        }
      }
    }

    // Validate query
    if (schema.query) {
      for (const [field, rule] of Object.entries(schema.query)) {
        const value = req.query[field];

        if (rule.required && (value === undefined || value === null || value === '')) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} is required`);
          continue;
        }

        if (value !== undefined && rule.type && typeof value !== rule.type) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(`${field} must be of type ${rule.type}`);
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors,
      });
      return;
    }

    next();
  };
};

