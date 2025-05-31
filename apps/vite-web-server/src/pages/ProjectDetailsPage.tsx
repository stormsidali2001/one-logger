import { useState, useEffect } from "react";
import { useProjectById } from "../hooks/queries/useProjectById";
import { useProjectMetrics } from "../hooks/queries/useProjectMetrics";
import { useProjectConfig } from "../hooks/queries/useProjectConfig";
import { useClearProjectLogs } from "../hooks/queries/useClearProjectLogs";
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
  const clearProjectLogs = useClearProjectLogs();
  
  // Clear logs dialog state
  const [clearLogsDialogOpen, setClearLogsDialogOpen] = useState(false);
  
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
  
  // Clear logs handlers
  const handleClearLogs = () => {
    setClearLogsDialogOpen(true);
  };
  
  const handleConfirmClearLogs = () => {
    clearProjectLogs.mutate(projectId, {
      onSuccess: () => {
        setClearLogsDialogOpen(false);
      }
    });
  };
  
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
          onClearLogs={handleClearLogs}
          onRefresh={handleRefresh}
        />

        {/* Summary Cards */}
        <ProjectSummaryCards
          metrics={metrics}
          isLoadingMetrics={isLoadingMetrics}
        />

        {/* Tabs */}
        <Tabs defaultValue="logs" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
            <TabsTrigger 
              value="logs" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4" />
              Logs
            </TabsTrigger>
            <TabsTrigger 
              value="metrics" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="h-4 w-4" />
              Metrics
            </TabsTrigger>
            <TabsTrigger 
              value="config" 
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="logs" className="mt-6">
            <ProjectLogsTable projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-6">
            <ProjectMetricsTab projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="config" className="mt-6">
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
      
      {/* Clear Logs Confirmation Dialog */}
      <ConfirmDialog
        open={clearLogsDialogOpen}
        onOpenChange={setClearLogsDialogOpen}
        title="Clear All Logs?"
        description="This will permanently delete all logs for this project. The project itself will remain, but all log data will be lost. This action cannot be undone."
        onConfirm={handleConfirmClearLogs}
        loading={clearProjectLogs.isPending}
        confirmLabel="Clear Logs"
      />
    </>
  );
}