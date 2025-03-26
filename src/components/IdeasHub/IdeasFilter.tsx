
import { IdeaCategory } from '@/types/supabase';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface IdeasFilterProps {
  categories: IdeaCategory[];
  filter: {
    status: string;
    category: string;
    search: string;
  };
  onChange: (filter: Partial<{ status: string; category: string; search: string }>) => void;
}

export default function IdeasFilter({ categories, filter, onChange }: IdeasFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Select
        value={filter.status}
        onValueChange={(value) => onChange({ status: value })}
      >
        <SelectTrigger className="w-full sm:w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="developing">Developing</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>
      
      <Select
        value={filter.category}
        onValueChange={(value) => onChange({ category: value })}
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
