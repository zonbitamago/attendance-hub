'use client';

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const paddingSizes = {
  none: 'p-0',
  sm: 'p-2',
  md: 'p-4',
  lg: 'p-6',
} as const;

export function Card({ children, hover = true, padding = 'md', className = '' }: CardProps) {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200';
  const hoverStyles = hover ? 'hover:shadow-md transition-shadow duration-200' : '';
  const paddingStyle = paddingSizes[padding];

  const classes = [
    baseStyles,
    hoverStyles,
    paddingStyle,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
}
