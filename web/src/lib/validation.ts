/**
 * Client-Side Form Validation Library
 *
 * Provides reusable validators and a useFormValidation hook for React forms.
 */

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export type Validator<T = string> = (value: T) => ValidationResult;

export interface FieldConfig<T = string> {
  validators: Validator<T>[];
  required?: boolean;
  requiredMessage?: string;
}

export interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

/**
 * Validates that a value is not empty
 */
export const required = (message = 'This field is required'): Validator => (value) => ({
  valid: value !== null && value !== undefined && value.trim().length > 0,
  message,
});

/**
 * Validates minimum length
 */
export const minLength = (min: number, message?: string): Validator => (value) => ({
  valid: !value || value.length >= min,
  message: message || `Must be at least ${min} characters`,
});

/**
 * Validates maximum length
 */
export const maxLength = (max: number, message?: string): Validator => (value) => ({
  valid: !value || value.length <= max,
  message: message || `Must be at most ${max} characters`,
});

/**
 * Validates email format
 */
export const email = (message = 'Please enter a valid email address'): Validator => (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    valid: !value || emailRegex.test(value),
    message,
  };
};

/**
 * Validates US phone number format
 */
export const phone = (message = 'Please enter a valid phone number'): Validator => (value) => {
  // Remove all non-digits
  const digits = value?.replace(/\D/g, '') || '';
  // US phone: 10 digits, or 11 starting with 1
  const valid = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
  return {
    valid: !value || valid,
    message,
  };
};

/**
 * Validates ZIP code format (5 or 9 digits)
 */
export const zipCode = (message = 'Please enter a valid ZIP code'): Validator => (value) => {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return {
    valid: !value || zipRegex.test(value),
    message,
  };
};

/**
 * Validates password strength
 */
export const password = (options?: {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
}): Validator => {
  const {
    minLength: min = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecial = false,
  } = options || {};

  return (value) => {
    if (!value) return { valid: true };

    const errors: string[] = [];

    if (value.length < min) {
      errors.push(`at least ${min} characters`);
    }
    if (requireUppercase && !/[A-Z]/.test(value)) {
      errors.push('an uppercase letter');
    }
    if (requireLowercase && !/[a-z]/.test(value)) {
      errors.push('a lowercase letter');
    }
    if (requireNumber && !/\d/.test(value)) {
      errors.push('a number');
    }
    if (requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('a special character');
    }

    return {
      valid: errors.length === 0,
      message: errors.length > 0 ? `Password must contain ${errors.join(', ')}` : undefined,
    };
  };
};

/**
 * Validates value matches another field
 */
export const matches = (fieldName: string, getValue: () => string, message?: string): Validator => (value) => ({
  valid: value === getValue(),
  message: message || `Must match ${fieldName}`,
});

/**
 * Validates value is a valid date
 */
export const date = (message = 'Please enter a valid date'): Validator => (value) => {
  if (!value) return { valid: true };
  const d = new Date(value);
  return {
    valid: d instanceof Date && !isNaN(d.getTime()),
    message,
  };
};

/**
 * Validates date is in the past
 */
export const pastDate = (message = 'Date must be in the past'): Validator => (value) => {
  if (!value) return { valid: true };
  const d = new Date(value);
  return {
    valid: d instanceof Date && !isNaN(d.getTime()) && d < new Date(),
    message,
  };
};

/**
 * Validates date is in the future
 */
export const futureDate = (message = 'Date must be in the future'): Validator => (value) => {
  if (!value) return { valid: true };
  const d = new Date(value);
  return {
    valid: d instanceof Date && !isNaN(d.getTime()) && d > new Date(),
    message,
  };
};

/**
 * Validates age is at least minimum
 */
export const minAge = (years: number, message?: string): Validator => (value) => {
  if (!value) return { valid: true };
  const dob = new Date(value);
  const today = new Date();
  const age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())
    ? age - 1
    : age;
  return {
    valid: actualAge >= years,
    message: message || `Must be at least ${years} years old`,
  };
};

/**
 * Custom validator with regex
 */
export const pattern = (regex: RegExp, message: string): Validator => (value) => ({
  valid: !value || regex.test(value),
  message,
});

/**
 * Validates value is one of allowed values
 */
export const oneOf = <T extends string>(values: T[], message?: string): Validator => (value) => ({
  valid: !value || values.includes(value as T),
  message: message || `Must be one of: ${values.join(', ')}`,
});

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Run all validators on a value
 */
export function validate(value: string, validators: Validator[]): ValidationResult {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
}

/**
 * Validate all fields in a form
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  config: Partial<Record<keyof T, FieldConfig>>
): Record<keyof T, string | null> {
  const errors = {} as Record<keyof T, string | null>;

  for (const [field, fieldConfig] of Object.entries(config) as [keyof T, FieldConfig][]) {
    const value = values[field] || '';

    // Check required first
    if (fieldConfig.required && !value.trim()) {
      errors[field] = fieldConfig.requiredMessage || 'This field is required';
      continue;
    }

    // Run validators
    const result = validate(value, fieldConfig.validators);
    errors[field] = result.valid ? null : result.message || 'Invalid value';
  }

  return errors;
}

/**
 * Check if form has any errors
 */
export function hasErrors(errors: Record<string, string | null>): boolean {
  return Object.values(errors).some((error) => error !== null);
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format phone number as user types
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

/**
 * Format ZIP code
 */
export function formatZip(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5, 9)}`;
}

/**
 * Format credit card number
 */
export function formatCreditCard(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.match(/.{1,4}/g)?.join(' ') || digits;
}
