
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ className, onClick, size = 'md' }: LogoProps) {
  const navigate = useNavigate();
  
  const sizeClasses = {
    sm: 'h-14',
    md: 'h-20',
    lg: 'h-28',
    xl: 'h-36'
  };
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate('/');
    }
  };

  return (
    <div 
      className={cn("cursor-pointer", className)}
      onClick={handleClick}
    >
      <img 
        src="/lovable-uploads/62347021-519c-4636-90eb-8cb27c0c0bd3.png" 
        alt="App Whisperer" 
        className={cn(sizeClasses[size], "object-contain")}
      />
    </div>
  );
}
