import React from 'react';

interface RevoraLogoProps {
  size?: number;
  className?: string;
  accent?: 'terracotta' | 'moss' | 'gold' | 'charcoal';
}

export const RevoraLogo: React.FC<RevoraLogoProps> = ({ 
  size = 28, 
  className = '', 
  accent = 'terracotta' 
}) => {
  const accentColor = accent === 'moss' 
    ? '#6F7F5F' 
    : accent === 'gold' 
    ? '#E5C378' 
    : accent === 'charcoal' 
    ? '#121212' 
    : '#C85A3E';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="REVORA brand mark"
    >
      {/* Precision geometric continuous 'R' form representing Rotation & Recovery */}
      {/* Vertical Spine */}
      <line x1="8" y1="5.5" x2="8" y2="26.5" stroke="#121212" strokeWidth="2.75" strokeLinecap="round" />
      {/* Upper Loop */}
      <path
        d="M 8 5.5 H 17.5 C 21.6 5.5, 24.5 8.2, 24.5 12.2 C 24.5 16.2, 21.6 18.9, 17.5 18.9 H 8"
        stroke="#121212"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Dynamic Diagonal Recovery Vector */}
      <path
        d="M 15.5 18.5 L 24 26.5"
        stroke="#121212"
        strokeWidth="2.75"
        strokeLinecap="round"
      />
      {/* Subtle Rotation / Recovery Pivot Point Accent */}
      <circle cx="16" cy="12.2" r="1.75" fill={accentColor} />
    </svg>
  );
};
