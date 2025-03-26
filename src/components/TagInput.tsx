
import React, { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  maxTags?: number;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = 'Add tag...',
  className = '',
  maxTags = 10
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Don't add if already exists or reached max tags
    if (value.includes(trimmedTag) || value.length >= maxTags) {
      setInputValue('');
      return;
    }
    
    onChange([...value, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue) {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue) {
      addTag(inputValue);
    }
  };

  return (
    <div 
      className={`flex flex-wrap gap-1.5 p-1 border rounded-md ${
        isFocused ? 'ring-2 ring-offset-0 ring-primary/20 border-primary' : ''
      } ${className}`}
      onClick={() => {
        inputRef.current?.focus();
      }}
    >
      {value.map((tag, index) => (
        <Badge 
          key={index} 
          variant="secondary"
          className="flex items-center gap-1 px-2 py-1"
        >
          {tag}
          <button 
            type="button" 
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-primary/20"
            aria-label={`Remove ${tag} tag`}
          >
            <XIcon className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      <div className="flex-1 flex items-center min-w-[120px]">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder={value.length === 0 ? placeholder : ''}
          className="border-0 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        
        {inputValue && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="mr-1 p-1 rounded-md hover:bg-secondary"
          >
            <PlusIcon className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}
