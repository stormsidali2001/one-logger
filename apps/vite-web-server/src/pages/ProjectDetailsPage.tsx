import { useState, useEffect } from "react";
import { useProjectById } from "../hooks/queries/useProjectById";
import { useProjectMetrics } from "../hooks/queries/useProjectMetrics";
import { useProjectConfig } from "../hooks/queries/useProjectConfig";
import { useProjectOperations } from "../hooks/useProjectOperations";
import { useProjectConfigManager } from "../hooks/useProjectConfigManager";
import { ProjectLogsTable } from "../components/projects/ProjectLogsTable";
import { ProjectMetricsTab } from "../components/projects/ProjectMetricsTab";
import { ProjectHeader } from "../components/projects/ProjectHeader";
import { ProjectSummaryCards } from "../components/projects/ProjectSummaryCards";
import { ProjectConfigurationTab } from "../components/projects/ProjectConfigurationTab";
import { ProjectNotFound, ProjectLoading, ProjectError } from "../components/projects/ProjectLoadingStates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, Settings } from "lucide-react";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { ConfirmDialog } from "../components/projects/ConfirmDialog";

interface ProjectDetailsPageProps {
  projectId: string;
}

export default function ProjectDetailsPage({ projectId }: ProjectDetailsPageProps) {
  const { data: project, isLoading, isError } = useProjectById(projectId);
  const { data: metrics, isLoading: isLoadingMetrics } = useProjectMetrics(projectId);
  const { data: projectConfig, isLoading: isLoadingConfig } = useProjectConfig(projectId);
  
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
  
  const {
    configText,
    configError,
    isConfigModified,
    handleConfigChange,
    handleSaveConfig,
    handleResetConfig,
    updateProjectConfigMutation
  } = useProjectConfigManager(projectId, projectConfig);
  
  // Calculate loading state
  const isRefreshing = isLoading || isLoadingMetrics || isLoadingConfig;

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
      <div className="container mx-auto p-6 max-w-6xl space-y-8">
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

        {/* Summary Cards */}
        <ProjectSummaryCards
          metrics={metrics}
          isLoadingMetrics={isLoadingMetrics}
        />

        {/* Tabs */}
        <Tabs defaultValue="logs" className="w-full">
          <div className="border-b mb-6">
            <TabsList className="bg-transparent h-12 p-0">
              <TabsTrigger 
                value="logs" 
                className="gap-2 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none transition-colors hover:bg-muted/30"
              >
                <FileText className="h-4 w-4" />
                Logs
              </TabsTrigger>
              <TabsTrigger 
                value="metrics" 
                className="gap-2 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none transition-colors hover:bg-muted/30"
              >
                <BarChart3 className="h-4 w-4" />
                Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="config" 
                className="gap-2 rounded-none h-full data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none transition-colors hover:bg-muted/30"
              >
                <Settings className="h-4 w-4" />
                Configuration
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="logs" className="mt-0">
            <ProjectLogsTable projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-0">
            <ProjectMetricsTab projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="config" className="mt-0">
            <ProjectConfigurationTab
              isLoadingConfig={isLoadingConfig}
              configText={configText}
              configError={configError}
              isConfigModified={isConfigModified}
              onConfigChange={handleConfigChange}
              onSaveConfig={handleSaveConfig}
              onResetConfig={handleResetConfig}
              isSaving={updateProjectConfigMutation.isPending}
            />
          </TabsContent>
        </Tabs>
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