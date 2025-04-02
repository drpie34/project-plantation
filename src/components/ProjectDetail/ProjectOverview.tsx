import { Document, Idea } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common';
import { Save, Edit2 } from 'lucide-react';

interface ProjectOverviewProps {
  overviewDocument: Document | null;
  sectionContent: Record<string, string>;
  editMode: string | null;
  isSaving: boolean;
  linkedIdea?: Idea | null;
  onEditSection: (section: string) => void;
  onCancelEdit: () => void;
  onSectionChange: (section: string, content: string) => void;
  onSaveDocument: () => Promise<boolean>;
}

export default function ProjectOverview({
  overviewDocument,
  sectionContent,
  editMode,
  isSaving,
  linkedIdea,
  onEditSection,
  onCancelEdit,
  onSectionChange,
  onSaveDocument
}: ProjectOverviewProps) {
  if (!overviewDocument) {
    return (
      <div className="text-center py-8 text-gray-500">
        No project overview document found
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Linked Idea Card */}
      {linkedIdea && (
        <div className="border rounded-md p-4 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <Badge className="bg-blue-100 text-blue-800 mr-2">Linked Idea</Badge>
                <h3 className="font-medium">{linkedIdea.title}</h3>
              </div>
              
              <details className="cursor-pointer">
                <summary className="font-medium text-sm text-blue-600 hover:text-blue-800 transition-colors">
                  View idea details
                </summary>
                <div className="mt-3 space-y-2 p-3 bg-gray-50 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium">Description</h4>
                    <p className="text-sm text-gray-600">{linkedIdea.description}</p>
                  </div>
                  
                  {linkedIdea.target_audience && (
                    <div>
                      <h4 className="text-sm font-medium">Target Audience</h4>
                      <p className="text-sm text-gray-600">{linkedIdea.target_audience}</p>
                    </div>
                  )}
                  
                  {linkedIdea.problem_solved && (
                    <div>
                      <h4 className="text-sm font-medium">Problem Solved</h4>
                      <p className="text-sm text-gray-600">{linkedIdea.problem_solved}</p>
                    </div>
                  )}
                  
                  {linkedIdea.tags && linkedIdea.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium">Tags</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {linkedIdea.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-gray-100">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
      
      {/* Description Section */}
      <div className={`prose max-w-none ${editMode === 'description' ? 'bg-blue-100' : 'bg-blue-50'} border border-blue-100 rounded-lg p-4 relative`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-blue-800 font-medium">Description</h4>
          {!editMode && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-blue-700"
              onClick={() => onEditSection('description')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {editMode === 'description' ? (
          <>
            <Textarea
              value={sectionContent.description}
              onChange={(e) => onSectionChange('description', e.target.value)}
              className="min-h-[120px] text-sm mb-2"
              placeholder="Enter project description..."
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={onSaveDocument}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div>
            {sectionContent.description.split('\n').map((line, idx) => (
              <p key={idx} className="text-sm">{line}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* Goals Section */}
      <div className={`prose max-w-none ${editMode === 'goals' ? 'bg-green-100' : 'bg-green-50'} border border-green-100 rounded-lg p-4 relative`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-green-800 font-medium">Project Goals</h4>
          {!editMode && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-green-700"
              onClick={() => onEditSection('goals')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {editMode === 'goals' ? (
          <>
            <Textarea
              value={sectionContent.goals}
              onChange={(e) => onSectionChange('goals', e.target.value)}
              className="min-h-[120px] text-sm mb-2"
              placeholder="Enter project goals..."
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={onSaveDocument}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div>
            {sectionContent.goals.split('\n').map((line, idx) => (
              <p key={idx} className="text-sm">{line}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* Features Section */}
      <div className={`prose max-w-none ${editMode === 'features' ? 'bg-purple-100' : 'bg-purple-50'} border border-purple-100 rounded-lg p-4 relative`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-purple-800 font-medium">Key Features</h4>
          {!editMode && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-purple-700"
              onClick={() => onEditSection('features')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {editMode === 'features' ? (
          <>
            <Textarea
              value={sectionContent.features}
              onChange={(e) => onSectionChange('features', e.target.value)}
              className="min-h-[120px] text-sm mb-2"
              placeholder="Enter key features..."
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={onSaveDocument}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div>
            {sectionContent.features.split('\n').map((line, idx) => (
              <p key={idx} className="text-sm">{line}</p>
            ))}
          </div>
        )}
      </div>
      
      {/* Considerations Section */}
      <div className={`prose max-w-none ${editMode === 'considerations' ? 'bg-orange-100' : 'bg-orange-50'} border border-orange-100 rounded-lg p-4 relative`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-orange-800 font-medium">Additional Considerations</h4>
          {!editMode && (
            <Button 
              variant="ghost" 
              size="sm"
              className="h-6 px-2 text-orange-700"
              onClick={() => onEditSection('considerations')}
            >
              <Edit2 className="h-3 w-3 mr-1" />
              Edit
            </Button>
          )}
        </div>
        
        {editMode === 'considerations' ? (
          <>
            <Textarea
              value={sectionContent.considerations}
              onChange={(e) => onSectionChange('considerations', e.target.value)}
              className="min-h-[120px] text-sm mb-2"
              placeholder="Enter additional considerations..."
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={onSaveDocument}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="small" className="mr-1" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-3 w-3 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <div>
            {sectionContent.considerations.split('\n').map((line, idx) => (
              <p key={idx} className="text-sm">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}