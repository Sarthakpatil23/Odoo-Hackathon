import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-5 transition-colors duration-150",
        className
      )}
      {...props}
    />
  );
}
