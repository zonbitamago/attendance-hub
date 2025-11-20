'use client';

import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  error?: string;
  ariaLabel?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, name, error, ariaLabel, className = '', ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 border rounded-md text-gray-900 placeholder:text-gray-400';
    const focusStyles = 'focus:outline-none focus:ring-2 focus:ring-blue-500';
    const errorStyles = error
      ? 'border-red-500'
      : 'border-gray-300';

    const classes = [
      baseStyles,
      focusStyles,
      errorStyles,
      className,
    ].filter(Boolean).join(' ');

    return (
      <div>
        <input
          ref={ref}
          id={id}
          name={name}
          className={classes}
          aria-label={ariaLabel}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
