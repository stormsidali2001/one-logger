import { createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryProvider } from '../providers/QueryProvider';
import { ToasterProvider } from '../providers/ToasterProvider';
import { AppLayout } from '../components/layout/AppLayout';

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <AppLayout />
      <ToasterProvider />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </QueryProvider>
  ),
});