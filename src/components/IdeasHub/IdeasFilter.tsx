import TagFilter from './TagFilter';

interface IdeasFilterProps {
  tags: string[];
  filter: {
    tag: string;
    search: string;
  };
  onChange: (filter: Partial<{ tag: string; search: string }>) => void;
}

export default function IdeasFilter({ tags, filter, onChange }: IdeasFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <TagFilter
        tags={tags}
        selectedTag={filter.tag}
        onChange={(value) => onChange({ tag: value })}
      />
    </div>
  );
}