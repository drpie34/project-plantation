
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TagInput } from '@/components/TagInput';
import { Project } from '@/types/supabase';

interface IdeaFormFieldsProps {
  formData: {
    title: string;
    description: string;
    target_audience: string;
    problem_solved: string;
    tags: string[];
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleTagsChange: (tags: string[]) => void;
  projects: Project[];
  selectedProject: string;
  setSelectedProject: (id: string) => void;
}

const IdeaFormFields = ({
  formData,
  handleChange,
  handleTagsChange,
  projects,
  selectedProject,
  setSelectedProject
}: IdeaFormFieldsProps) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter idea title"
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="project" className="text-right">
          Project <span className="text-red-500">*</span>
        </Label>
        <div className="col-span-3">
          {projects.length > 0 ? (
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">
              No projects found. <Button variant="link" className="p-0 h-auto">Create a new project</Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="description" className="text-right">
          Description
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe your idea"
          className="col-span-3"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="target_audience" className="text-right">
          Target Audience
        </Label>
        <Textarea
          id="target_audience"
          name="target_audience"
          value={formData.target_audience}
          onChange={handleChange}
          placeholder="Who is this idea for?"
          className="col-span-3"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="problem_solved" className="text-right">
          Problem Solved
        </Label>
        <Textarea
          id="problem_solved"
          name="problem_solved"
          value={formData.problem_solved}
          onChange={handleChange}
          placeholder="What problem does this idea solve?"
          className="col-span-3"
          rows={2}
        />
      </div>
      
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="tags" className="text-right">
          Tags
        </Label>
        <div className="col-span-3">
          <TagInput
            tags={formData.tags}
            setTags={handleTagsChange}
            placeholder="Add tags..."
            maxTags={5}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Press Enter or comma to add a tag (max 5)
          </p>
        </div>
      </div>
    </div>
  );
};

export default IdeaFormFields;
