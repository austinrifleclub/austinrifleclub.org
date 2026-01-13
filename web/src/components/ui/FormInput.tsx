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
        <label htmlFor={inputId} className="form-label">
          {label}
          {props.required && <span className="required">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          onChange={handleChange}
          className={`form-input w-full ${hasError ? 'has-error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />
        {hasError && (
          <p id={`${inputId}-error`} className="form-error">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helpText && !hasError && (
          <p id={`${inputId}-help`} className="form-help">
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
        <label htmlFor={selectId} className="form-label">
          {label}
          {props.required && <span className="required">*</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`form-input w-full appearance-none cursor-pointer pr-10 ${hasError ? 'has-error' : ''}`}
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
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-5 w-5 text-muted" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        {hasError && (
          <p id={`${selectId}-error`} className="form-error">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helpText && !hasError && (
          <p id={`${selectId}-help`} className="form-help">
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
        <label htmlFor={textareaId} className="form-label">
          {label}
          {props.required && <span className="required">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          onChange={handleChange}
          className={`form-input w-full resize-y min-h-[100px] ${hasError ? 'has-error' : ''}`}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${textareaId}-error` : helpText ? `${textareaId}-help` : undefined}
          {...props}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {hasError && (
              <p id={`${textareaId}-error`} className="form-error">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
            {helpText && !hasError && (
              <p id={`${textareaId}-help`} className="form-help">
                {helpText}
              </p>
            )}
          </div>
          {showCount && props.maxLength && (
            <p className={`text-sm font-mono ${charCount > props.maxLength * 0.9 ? 'text-danger-accent' : 'text-muted'}`}>
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
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex items-center h-5 mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={`
                h-5 w-5 rounded-md border-2 transition-all duration-200
                text-navy-600 focus:ring-0 focus:ring-offset-0
                checked:bg-navy-600 checked:border-navy-600
                ${hasError ? 'border-crimson-400' : 'border-[var(--color-border)] group-hover:border-navy-400'}
              `}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${checkboxId}-error` : helpText ? `${checkboxId}-help` : undefined}
              {...props}
            />
          </div>
          <div className="text-sm">
            <span className="text-secondary font-medium">
              {label}
              {props.required && <span className="required">*</span>}
            </span>
            {helpText && (
              <p id={`${checkboxId}-help`} className="form-help mt-0.5">
                {helpText}
              </p>
            )}
          </div>
        </label>
        {hasError && (
          <p id={`${checkboxId}-error`} className="form-error ml-8">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
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
      <legend className="form-label mb-3">
        {label}
        {required && <span className="required">*</span>}
      </legend>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`selectable-card flex items-start gap-3 p-3 ${
              value === option.value ? 'selected' : ''
            } ${hasError ? 'border-crimson-300' : ''}`}
          >
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="radio"
                id={`${name}-${option.value}`}
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange?.(e.target.value)}
                className={`
                  h-5 w-5 border-2 transition-all duration-200
                  text-navy-600 focus:ring-0 focus:ring-offset-0
                  ${hasError ? 'border-crimson-400' : 'border-[var(--color-border)]'}
                `}
              />
            </div>
            <div className="text-sm flex-1">
              <span className={`font-medium ${value === option.value ? 'text-accent' : 'text-secondary'}`}>
                {option.label}
              </span>
              {option.description && (
                <p className="text-muted mt-0.5">{option.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
      {hasError && (
        <p className="form-error mt-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helpText && !hasError && (
        <p className="form-help mt-2">{helpText}</p>
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
