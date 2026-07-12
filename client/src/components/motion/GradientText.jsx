import React from 'react';
import { cn } from '../../lib/utils';

export function GradientText({ children, className }) {
  return (
    <span className={cn("bg-gradient-to-r from-primary to-pop bg-clip-text text-transparent", className)}>
      {children}
    </span>
  );
}
