import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sdk } from '@/lib/sdk';
import type { Project, ProjectCreateData, ProjectUpdateData } from '@notjustcoders/one-logger-server-sdk';
import { queryKeys } from './queryKeys';

export function useProjects() {
  const queryClient = useQueryClient();

  // Query: Get all projects
  const projectsQuery = useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn: () => sdk.projects.getAll(),
  });

  // Mutation: Create project
  const createProject = useMutation({
    mutationFn: (data: ProjectCreateData) =>
      sdk.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Update project
  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdateData }) =>
      sdk.projects.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Delete project
  const deleteProject = useMutation({
    mutationFn: (id: string) => sdk.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  return {
    ...projectsQuery,
    createProject,
    updateProject,
    deleteProject,
  };
}