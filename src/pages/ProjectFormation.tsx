
import { useLocation, useNavigate } from 'react-router-dom';
import ProjectFormation from '@/components/ProjectFormation/ProjectFormation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProjectFormationPage() {
  // Get query parameters from URL
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const ideaId = searchParams.get('ideaId') || undefined;
  const researchId = searchParams.get('researchId') || undefined;
  
  // Get previous location from state, defaulting to ideas hub or the specific idea detail
  const previousPath = location.state?.from || (ideaId ? `/ideas/${ideaId}` : '/ideas');

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate(previousPath)}
          className="mr-2 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Project Formation</h1>
          <p className="text-gray-600">
            Turn your ideas and research into structured projects with AI assistance
          </p>
        </div>
      </div>
      <ProjectFormation ideaId={ideaId} researchId={researchId} />
    </div>
  );
}
