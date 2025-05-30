import { createRootRoute, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { QueryProvider } from '../providers/QueryProvider';
import { ToasterProvider } from '../providers/ToasterProvider';

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
        <ToasterProvider />
      </div>
      <TanStackRouterDevtools />
      
    </QueryProvider>
  ),
});