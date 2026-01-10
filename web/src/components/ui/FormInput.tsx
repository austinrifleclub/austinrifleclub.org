/**
 * Form Input Components
 *
 * Reusable form components with validation support.
 */

import { useState, forwardRef } from 'react';
import { formatPhone, formatZip } from '../../lib/validation';

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  helpText?: string;
  formatAs?: 'phone' | 'zip' | 'currency';
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helpText, formatAs, className = '', onChange, ...props }, ref) => {
    const hasError = !!error;
    const inputId = props.id || props.name;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;

      // Apply formatting
      if (formatAs === 'phone') {
        value = formatPhone(value);
        e.target.value = value;
      } else if (formatAs === 'zip') {
        value = formatZip(value);
        e.target.value = value;
      }

      onChange?.(e);
    };

    return (
      <div className={`form-group ${className}`}>
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500'
            }
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        {hasError && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helpText && !hasError && (
          <p id={`${inputId}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string | null;
  helpText?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helpText, options, placeholder, className = '', ...props }, ref) => {
    const hasError = !!error;
    const selectId = props.id || props.name;

    return (
      <div className={`form-group ${className}`}>
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500'
            }
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${selectId}-error` : helpText ? `${selectId}-help` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {hasError && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        {helpText && !hasError && (
          <p id={`${selectId}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string | null;
  helpText?: string;
  showCount?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, helpText, showCount, className = '', ...props }, ref) => {
    const [charCount, setCharCount] = useState(props.value?.toString().length || 0);
    const hasError = !!error;
    const textareaId = props.id || props.name;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      props.onChange?.(e);
    };

    return (
      <div className={`form-group ${className}`}>
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          onChange={handleChange}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${hasError
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500'
            }
          `}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
          {...props}
        />
        <div className="flex justify-between mt-1">
          <div>
            {hasError && (
              <p id={`${textareaId}-error`} className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
            {helpText && !hasError && (
              <p id={`${textareaId}-help`} className="text-sm text-gray-500 dark:text-gray-400">
                {helpText}
              </p>
            )}
          </div>
          {showCount && props.maxLength && (
            <p className={`text-sm ${charCount > props.maxLength * 0.9 ? 'text-orange-500' : 'text-gray-500'}`}>
              {charCount}/{props.maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string | React.ReactNode;
  error?: string | null;
  helpText?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helpText, className = '', ...props }, ref) => {
    const hasError = !!error;
    const checkboxId = props.id || props.name;

    return (
      <div className={`form-group ${className}`}>
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={`
                h-4 w-4 rounded border-gray-300 dark:border-gray-600
                text-blue-600 focus:ring-blue-500
                ${hasError ? 'border-red-300' : ''}
              `}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined}
              {...props}
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor={checkboxId} className="text-gray-700 dark:text-gray-300">
              {label}
              {props.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {helpText && (
              <p id={`${checkboxId}-help`} className="text-gray-500 dark:text-gray-400">
                {helpText}
              </p>
            )}
          </div>
        </div>
        {hasError && (
          <p id={`${checkboxId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400 ml-7">
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = 'FormCheckbox';

// ============================================================================
// RADIO GROUP COMPONENT
// ============================================================================

export interface FormRadioGroupProps {
  name: string;
  label: string;
  options: Array<{ value: string; label: string; description?: string }>;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export function FormRadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  error,
  helpText,
  required,
  className = '',
}: FormRadioGroupProps) {
  const hasError = !!error;

  return (
    <fieldset className={`form-group ${className}`}>
      <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className={`
                  h-4 w-4 border-gray-300 dark:border-gray-600
                  text-blue-600 focus:ring-blue-500
                  ${hasError ? 'border-red-300' : ''}
                `}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`${name}-${option.value}`}
                className="font-medium text-gray-700 dark:text-gray-300"
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-gray-500 dark:text-gray-400">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helpText && !hasError && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </fieldset>
  );
}

// ============================================================================
// FORM FIELD ROW COMPONENT
// ============================================================================

interface FormRowProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function FormRow({ children, columns = 2, className = '' }: FormRowProps) {
  return (
    <div
      className={`
        grid gap-4
        ${columns === 1 ? 'grid-cols-1' : ''}
        ${columns === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
        ${columns === 3 ? 'grid-cols-1 md:grid-cols-3' : ''}
        ${columns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
