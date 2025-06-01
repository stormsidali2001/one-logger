import { createFileRoute } from '@tanstack/react-router';
import ProjectLogsPage from '../pages/ProjectLogsPage';

export const Route = createFileRoute('/projects/$projectId/logs')({  
  component: () => {
    const { projectId } = Route.useParams();

    return <ProjectLogsPage projectId={projectId} />;
  },
});