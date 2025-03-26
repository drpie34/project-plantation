
import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export const TagInput = ({ tags, setTags, placeholder = 'Add tag...', maxTags = 10 }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      e.preventDefault();
      
      if (tags.length >= maxTags) {
        return;
      }
      
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10">
        {tags.map((tag, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="text-primary/70 hover:text-primary"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length >= maxTags ? `Maximum ${maxTags} tags` : placeholder}
          disabled={tags.length >= maxTags}
          className="flex-1 min-w-[120px] border-0 focus-visible:ring-0 p-0 h-8"
        />
      </div>
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length} of {maxTags} tags used
        </p>
      )}
    </div>
  );
};
