
import { useLocation } from 'react-router-dom';
import ProjectFormation from '@/components/ProjectFormation/ProjectFormation';

export default function ProjectFormationPage() {
  // Get query parameters from URL
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const ideaId = searchParams.get('ideaId') || undefined;
  const researchId = searchParams.get('researchId') || undefined;

  return (
    <div className="container max-w-4xl py-8 space-y-6">
      <h1 className="text-3xl font-bold">Project Formation</h1>
      <p className="text-gray-600">
        Turn your ideas and research into structured projects with AI assistance
      </p>
      <ProjectFormation ideaId={ideaId} researchId={researchId} />
    </div>
  );
}
