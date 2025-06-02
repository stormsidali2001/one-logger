import { useState, useEffect } from "react";
import { useProjectById } from "../hooks/queries/useProjectById";
import { useProjectMetrics } from "../hooks/queries/useProjectMetrics";
import { useClearProjectTraces } from "../hooks/queries/traces/useClearProjectTraces";
import { useProjectOperations } from "../hooks/useProjectOperations";
import { ProjectTracesTable } from "../components/projects/ProjectTracesTable";
import { ProjectHeader } from "../components/projects/ProjectHeader";
import { QuickAccessCards } from "../components/projects/QuickAccessCards";
import { ProjectNotFound, ProjectLoading, ProjectError } from "../components/projects/ProjectLoadingStates";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { ConfirmDialog } from "../components/projects/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ProjectTracesPageProps {
  projectId: string;
}

export default function ProjectTracesPage({ projectId }: ProjectTracesPageProps) {
  const { data: project, isLoading, isError } = useProjectById(projectId);
  const { data: metrics, isLoading: isLoadingMetrics } = useProjectMetrics(projectId);
  const clearProjectTraces = useClearProjectTraces();

  // Clear traces dialog state
  const [clearTracesDialogOpen, setClearTracesDialogOpen] = useState(false);
  
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
  
  // Clear traces handlers
  const handleClearTraces = () => {
    setClearTracesDialogOpen(true);
  };
  
  const handleConfirmClearTraces = () => {
    clearProjectTraces.mutate(projectId, {
      onSuccess: () => {
        setClearTracesDialogOpen(false);
      }
    });
  };
  
  // Calculate loading state
  const isRefreshing = isLoading || isLoadingMetrics;

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

          {/* Quick Access Cards */}
          <QuickAccessCards projectId={project.id} currentPage="traces" />



          {/* Traces Content */}
          <div className="bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Project Traces</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearTraces} 
                className="transition-all hover:border-orange-500/50 hover:bg-orange-50 text-orange-600 hover:text-orange-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Traces
              </Button>
            </div>
            <ProjectTracesTable projectId={project.id} />
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
      
      {/* Clear Traces Confirmation Dialog */}
      <ConfirmDialog
        open={clearTracesDialogOpen}
        onOpenChange={setClearTracesDialogOpen}
        title="Clear All Traces?"
        description="This will permanently delete all traces for this project. The project itself will remain, but all trace data will be lost. This action cannot be undone."
        onConfirm={handleConfirmClearTraces}
        loading={clearProjectTraces.isPending}
        confirmLabel="Clear Traces"
      />

    </>
  );
}