import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

interface TagFilterProps {
  tags: string[];
  selectedTag: string;
  onChange: (tag: string) => void;
}

export default function TagFilter({ tags, selectedTag, onChange }: TagFilterProps) {
  return (
    <Select
      value={selectedTag}
      onValueChange={onChange}
    >
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Filter by Tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tags</SelectItem>
        {tags.map(tag => (
          <SelectItem key={tag} value={tag}>
            {tag}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}