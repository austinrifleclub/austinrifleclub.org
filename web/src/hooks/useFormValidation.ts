/**
 * useFormValidation Hook
 *
 * React hook for managing form state and validation.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  validate,
  hasErrors,
} from '../lib/validation';
import type { Validator, FieldState } from '../lib/validation';

export interface FormFieldConfig {
  initialValue?: string;
  validators?: Validator[];
  required?: boolean;
  requiredMessage?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export type FormConfig<T extends string> = Record<T, FormFieldConfig>;

export interface UseFormValidationResult<T extends string> {
  values: Record<T, string>;
  errors: Record<T, string | null>;
  touched: Record<T, boolean>;
  dirty: Record<T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: T) => () => void;
  setValue: (field: T, value: string) => void;
  setError: (field: T, error: string | null) => void;
  setTouched: (field: T, touched: boolean) => void;
  validateField: (field: T) => boolean;
  validateForm: () => boolean;
  reset: () => void;
  setSubmitting: (value: boolean) => void;
  getFieldProps: (field: T) => {
    name: T;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: () => void;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
  };
}

export function useFormValidation<T extends string>(
  config: FormConfig<T>
): UseFormValidationResult<T> {
  const fields = Object.keys(config) as T[];

  // Initialize state
  const initialValues = useMemo(() => {
    const values = {} as Record<T, string>;
    for (const field of fields) {
      values[field] = config[field].initialValue || '';
    }
    return values;
  }, []);

  const [values, setValues] = useState<Record<T, string>>(initialValues);
  const [errors, setErrors] = useState<Record<T, string | null>>(() => {
    const errs = {} as Record<T, string | null>;
    for (const field of fields) {
      errs[field] = null;
    }
    return errs;
  });
  const [touched, setTouched] = useState<Record<T, boolean>>(() => {
    const t = {} as Record<T, boolean>;
    for (const field of fields) {
      t[field] = false;
    }
    return t;
  });
  const [dirty, setDirty] = useState<Record<T, boolean>>(() => {
    const d = {} as Record<T, boolean>;
    for (const field of fields) {
      d[field] = false;
    }
    return d;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate a single field
  const validateField = useCallback((field: T): boolean => {
    const fieldConfig = config[field];
    const value = values[field];
    let error: string | null = null;

    // Check required
    if (fieldConfig.required && !value.trim()) {
      error = fieldConfig.requiredMessage || 'This field is required';
    } else if (fieldConfig.validators && value) {
      // Run validators
      const result = validate(value, fieldConfig.validators);
      if (!result.valid) {
        error = result.message || 'Invalid value';
      }
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === null;
  }, [config, values]);

  // Validate all fields
  const validateFormFn = useCallback((): boolean => {
    let isValid = true;
    const newErrors = {} as Record<T, string | null>;

    for (const field of fields) {
      const fieldConfig = config[field];
      const value = values[field];
      let error: string | null = null;

      // Check required
      if (fieldConfig.required && !value.trim()) {
        error = fieldConfig.requiredMessage || 'This field is required';
        isValid = false;
      } else if (fieldConfig.validators && value) {
        // Run validators
        const result = validate(value, fieldConfig.validators);
        if (!result.valid) {
          error = result.message || 'Invalid value';
          isValid = false;
        }
      }

      newErrors[field] = error;
    }

    setErrors(newErrors);

    // Mark all fields as touched
    const allTouched = {} as Record<T, boolean>;
    for (const field of fields) {
      allTouched[field] = true;
    }
    setTouched(allTouched);

    return isValid;
  }, [config, fields, values]);

  // Check if form is valid
  const isValid = useMemo(() => !hasErrors(errors), [errors]);

  // Handle input change
  const handleChange = useCallback((field: T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    setDirty((prev) => ({ ...prev, [field]: true }));

    // Validate on change if configured
    if (config[field].validateOnChange !== false && touched[field]) {
      const fieldConfig = config[field];
      let error: string | null = null;

      if (fieldConfig.required && !value.trim()) {
        error = fieldConfig.requiredMessage || 'This field is required';
      } else if (fieldConfig.validators && value) {
        const result = validate(value, fieldConfig.validators);
        if (!result.valid) {
          error = result.message || 'Invalid value';
        }
      }

      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [config, touched]);

  // Handle blur
  const handleBlur = useCallback((field: T) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Validate on blur if configured
    if (config[field].validateOnBlur !== false) {
      validateField(field);
    }
  }, [config, validateField]);

  // Set value programmatically
  const setValue = useCallback((field: T, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setDirty((prev) => ({ ...prev, [field]: value !== initialValues[field] }));
  }, [initialValues]);

  // Set error programmatically
  const setError = useCallback((field: T, error: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set touched programmatically
  const setTouchedFn = useCallback((field: T, value: boolean) => {
    setTouched((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors(() => {
      const errs = {} as Record<T, string | null>;
      for (const field of fields) {
        errs[field] = null;
      }
      return errs;
    });
    setTouched(() => {
      const t = {} as Record<T, boolean>;
      for (const field of fields) {
        t[field] = false;
      }
      return t;
    });
    setDirty(() => {
      const d = {} as Record<T, boolean>;
      for (const field of fields) {
        d[field] = false;
      }
      return d;
    });
    setIsSubmitting(false);
  }, [fields, initialValues]);

  // Get field props for spreading on inputs
  const getFieldProps = useCallback((field: T) => ({
    name: field,
    value: values[field],
    onChange: handleChange(field),
    onBlur: handleBlur(field),
    'aria-invalid': touched[field] && !!errors[field],
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    dirty,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    setValue,
    setError,
    setTouched: setTouchedFn,
    validateField,
    validateForm: validateFormFn,
    reset,
    setSubmitting: setIsSubmitting,
    getFieldProps,
  };
}

export default useFormValidation;
