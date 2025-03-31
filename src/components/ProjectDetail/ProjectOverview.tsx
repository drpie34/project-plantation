import { Document } from '@/types/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common';
import { Save, Edit2 } from 'lucide-react';

interface ProjectOverviewProps {
  overviewDocument: Document | null;
  sectionContent: Record<string, string>;
  editMode: string | null;
  isSaving: boolean;
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