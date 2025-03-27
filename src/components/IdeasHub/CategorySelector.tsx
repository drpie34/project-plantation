
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { IdeaCategory } from '@/types/supabase';

interface CategorySelectorProps {
  categories: IdeaCategory[];
  selectedCategories: string[];
  onChange: (categoryId: string) => void;
}

const CategorySelector = ({ 
  categories, 
  selectedCategories, 
  onChange 
}: CategorySelectorProps) => {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label className="text-right">
        Categories
      </Label>
      <div className="col-span-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              type="button"
              variant={selectedCategories.includes(category.id) ? "default" : "outline"}
              size="sm"
              onClick={() => onChange(category.id)}
              style={{
                borderColor: selectedCategories.includes(category.id) ? undefined : category.color
              }}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
