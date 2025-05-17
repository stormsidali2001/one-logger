import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { Project } from '../../types/project';

export function useProjects() {
  const queryClient = useQueryClient();

  // Query: Get all projects
  const projectsQuery = useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn: () => window.electronAPI.getAllProjects(),
  });

  // Mutation: Create project
  const createProject = useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      window.electronAPI.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Update project
  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ name: string; description: string }> }) =>
      window.electronAPI.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Delete project
  const deleteProject = useMutation({
    mutationFn: (id: string) => window.electronAPI.deleteProject(id),
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