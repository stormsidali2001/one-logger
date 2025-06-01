import { useState, useEffect } from "react";
import { useProjectById } from "../hooks/queries/useProjectById";


import { useProjectOperations } from "../hooks/useProjectOperations";

import { Link, useLocation } from "@tanstack/react-router";
import { ProjectHeader } from "../components/projects/ProjectHeader";
import { ProjectNotFound, ProjectLoading, ProjectError } from "../components/projects/ProjectLoadingStates";
import { QuickAccessCards } from "../components/projects/QuickAccessCards";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { ConfirmDialog } from "../components/projects/ConfirmDialog";

interface ProjectDetailsPageProps {
  projectId: string;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
  const { data: project, isLoading, isError } = useProjectById(projectId);
  const location = useLocation();


  
  // Custom hooks for operations and state management
  const {
    editModalOpen,
    setEditModalOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    autoRefresh,
    setAutoRefresh,
    handleRefresh,
    handleDeleteProject,
    handleConfirmDelete,
    handleEditProject,
    handleEditSubmit,
    updateProject,
    deleteProject
  } = useProjectOperations(projectId);
  

  

  
  // Calculate loading state
  const isRefreshing = isLoading;

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, projectId, handleRefresh]);

  // Early returns for different states
  if (!projectId) {
    return <ProjectNotFound />;
  }

  if (isLoading) {
    return <ProjectLoading />;
  }

  if (isError || !project) {
    return <ProjectError projectId={projectId} project={project} />;
  }

  return (
    <>
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
        {/* Project Header */}
        <ProjectHeader
          project={project}
          isRefreshing={isRefreshing}
          autoRefresh={autoRefresh}
          onAutoRefreshChange={setAutoRefresh}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}

          onRefresh={handleRefresh}
        />



        {/* Quick Access Links */}
        <QuickAccessCards projectId={project.id} currentPage="details" />


        </div>
      </div>

      {/* Edit Project Modal */}
      <ProjectFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        initialData={project ? { name: project.name, description: project.description } : undefined}
        onSubmit={handleEditSubmit}
        loading={updateProject.isPending}
        mode="edit"
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Project?"
        description="This will permanently delete the project and all its logs. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleteProject.isPending}
        confirmLabel="Delete"
      />
      

    </>
  );
}