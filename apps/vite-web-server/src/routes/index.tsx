import { createFileRoute } from '@tanstack/react-router';
import { useProjects} from '../hooks';

export const Route = createFileRoute('/')({ 
  component: Dashboard,
});

function Dashboard() {

  const { data: projects} = useProjects();

  return <div>
    <h1>Dashboard</h1>
    <div>{JSON.stringify(projects)}</div>
  </div>
}