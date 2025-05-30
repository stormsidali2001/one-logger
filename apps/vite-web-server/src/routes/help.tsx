import { createFileRoute } from '@tanstack/react-router';
import HelpPage from '../pages/HelpPage';

export const Route = createFileRoute('/help')({
  component: HelpPage,
});