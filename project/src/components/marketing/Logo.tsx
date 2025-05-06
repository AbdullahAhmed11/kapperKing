import React from 'react';
import { Crown } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: {
      container: 'h-6',
      text: 'text-lg',
      crown: 'w-3 h-3'
    },
    md: {
      container: 'h-8',
      text: 'text-2xl',
      crown: 'w-4 h-4'
    },
    lg: {
      container: 'h-12',
      text: 'text-4xl',
      crown: 'w-6 h-6'
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizes[size].container} aspect-square relative`}>
        <Crown className={`${sizes[size].crown} text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-pink-500`} />
      </div>
      <span className={`ml-2 ${sizes[size].text} font-bold tracking-tight`}>
        <span className="text-gray-900">Kapper</span>
        <span className="bg-clip-text text-transparent bg-gradient-to-br from-primary-600 to-pink-500">king</span>
      </span>
    </div>
  );
}