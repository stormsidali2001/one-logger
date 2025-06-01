import { useState, useEffect } from "react";
import { useProjectById } from "../hooks/queries/useProjectById";


import { useProjectOperations } from "../hooks/useProjectOperations";

import { Link } from "@tanstack/react-router";
import { ProjectHeader } from "../components/projects/ProjectHeader";
import { ProjectNotFound, ProjectLoading, ProjectError } from "../components/projects/ProjectLoadingStates";
import { FileText, Activity, ExternalLink } from "lucide-react";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { ConfirmDialog } from "../components/projects/ConfirmDialog";

interface ProjectDetailsPageProps {
  projectId: string;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
  const { data: project, isLoading, isError } = useProjectById(projectId);


  
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link 
            to="/projects/$projectId/logs" 
            params={{ projectId: project.id }}
            className="group bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Logs</h3>
                  <p className="text-sm text-gray-600">View and manage application logs</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          <Link 
            to="/projects/$projectId/traces" 
            params={{ projectId: project.id }}
            className="group bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Project Traces</h3>
                  <p className="text-sm text-gray-600">Analyze distributed tracing data</p>
                </div>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
            </div>
          </Link>
        </div>


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