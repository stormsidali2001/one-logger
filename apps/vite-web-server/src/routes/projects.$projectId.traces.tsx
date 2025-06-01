import { createFileRoute } from '@tanstack/react-router';
import ProjectTracesPage from '../pages/ProjectTracesPage';

export const Route = createFileRoute('/projects/$projectId/traces')({  
  component: () => {
    const { projectId } = Route.useParams();

    return <ProjectTracesPage projectId={projectId} />;
  },
});