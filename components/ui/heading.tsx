'use client';

import React from 'react';

export interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

const headingSizes = {
  1: 'text-3xl sm:text-4xl font-bold',
  2: 'text-xl sm:text-2xl font-bold',
  3: 'text-lg font-semibold',
  4: 'text-base font-semibold',
  5: 'text-sm font-semibold',
  6: 'text-xs font-semibold',
} as const;

export function Heading({ level, children, className = '' }: HeadingProps) {
  const baseStyles = 'text-gray-900 dark:text-gray-100';

  const classes = [
    baseStyles,
    headingSizes[level],
    className,
  ].filter(Boolean).join(' ');

  switch (level) {
    case 1:
      return <h1 className={classes}>{children}</h1>;
    case 2:
      return <h2 className={classes}>{children}</h2>;
    case 3:
      return <h3 className={classes}>{children}</h3>;
    case 4:
      return <h4 className={classes}>{children}</h4>;
    case 5:
      return <h5 className={classes}>{children}</h5>;
    case 6:
      return <h6 className={classes}>{children}</h6>;
  }
}
