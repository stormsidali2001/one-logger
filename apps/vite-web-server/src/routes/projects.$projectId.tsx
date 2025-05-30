import { createFileRoute } from '@tanstack/react-router';
import ProjectDetailsPage from '../pages/ProjectDetailsPage';

export const Route = createFileRoute('/projects/$projectId')({
  component: ProjectDetailsPage,
});