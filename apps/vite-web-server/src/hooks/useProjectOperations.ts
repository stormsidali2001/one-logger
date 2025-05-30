import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useProjects } from './queries/useProjects';

export function useProjectOperations(projectId: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateProject, deleteProject } = useProjects();
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Auto-refresh state
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Manual refresh handler
  const handleRefresh = () => {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ["projects", "getById", projectId] });
      queryClient.invalidateQueries({ queryKey: ["logs", "metrics", projectId] });
      queryClient.invalidateQueries({ queryKey: ["logs", "metadataKeys", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects", "config", projectId] });
    }
  };

  const handleDeleteProject = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        toast.success("Project deleted successfully");
        navigate({ to: "/projects" });
      },
      onError: (error) => {
        toast.error("Failed to delete project", {
          description: error instanceof Error ? error.message : "Unknown error occurred"
        });
      }
    });
  };

  const handleEditProject = () => {
    setEditModalOpen(true);
  };

  const handleEditSubmit = (data: { name: string; description: string }) => {
    updateProject.mutate(
      { id: projectId, data },
      {
        onSuccess: () => {
          setEditModalOpen(false);
          toast.success("Project updated successfully");
        },
        onError: (error) => {
          toast.error("Failed to update project", {
            description: error instanceof Error ? error.message : "Unknown error occurred"
          });
        }
      }
    );
  };

  return {
    // State
    editModalOpen,
    setEditModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    autoRefresh,
    setAutoRefresh,
    
    // Handlers
    handleRefresh,
    handleDeleteProject,
    handleConfirmDelete,
    handleEditProject,
    handleEditSubmit,
    
    // Mutations
    updateProject,
    deleteProject
  };
}