import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import type { Project, CreateProjectData, UpdateProjectData } from '../../types/project';
import { apiClient } from '../../lib/api';

export function useProjects() {
  const queryClient = useQueryClient();

  // Query: Get all projects
  const projectsQuery = useQuery<Project[]>({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiClient.getProjects(),
  });

  // Mutation: Create project
  const createProject = useMutation({
    mutationFn: (data: CreateProjectData) =>
      apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Update project
  const updateProject = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectData }) =>
      apiClient.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });

  // Mutation: Delete project
  const deleteProject = useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
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