import React from 'react';

export function Logo({ className = "h-5 w-5" }) {
  return (
    <svg 
      className={`${className} text-foreground shrink-0 select-none`}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Layered isometric platform (Vercel-style geometric abstract) */}
      <path 
        d="M12 2L3 7L12 12L21 7L12 2Z" 
        fill="currentColor" 
        fillOpacity="0.15" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinejoin="round" 
      />
      <path 
        d="M3 12L12 17L21 12" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M3 17L12 22L21 17" 
        stroke="currentColor" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <circle cx="12" cy="7" r="1.5" fill="currentColor" />
    </svg>
  );
}
