import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { useProjectById } from "../hooks/queries/useProjectById";
import { useProjects } from "../hooks/queries/useProjects";
import { useProjectMetrics } from "../hooks/queries/useProjectMetrics";
import { ProjectLogsTable } from "../components/projects/ProjectLogsTable";
import { ProjectMetricsTab } from "../components/projects/ProjectMetricsTab";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  FileText, 
  BarChart3, 
  ChevronRight,
  AlertCircle,
  ArrowRightCircle,
  RefreshCw
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ProjectFormModal } from "../components/projects/ProjectFormModal";
import { ConfirmDialog } from "../components/projects/ConfirmDialog";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

export default function ProjectDetailsPage() {
  const params = useParams({ strict: false }) as { projectId: string };
  const projectId = params.projectId;
  const navigate = useNavigate();
  
  const { data: project, isLoading, isError } = useProjectById(projectId);
  const { data: metrics, isLoading: isLoadingMetrics } = useProjectMetrics(projectId);
  const { updateProject, deleteProject } = useProjects();
  const queryClient = useQueryClient();

  // State for modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for refresh
  const [autoRefresh, setAutoRefresh] = useState(false);
  const isRefreshing = isLoading || isLoadingMetrics ;

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      handleRefresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, projectId]);

  // Manual refresh handler
  const handleRefresh = () => {
    // Invalidate queries for project, metrics, and metadata keys
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ["projects", "getById", projectId] });
      queryClient.invalidateQueries({ queryKey: ["logs", "metrics", projectId] });
      queryClient.invalidateQueries({ queryKey: ["logs", "metadataKeys", projectId] });
    }
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <div>
              <h2 className="text-xl font-semibold">Project Not Found</h2>
              <p className="text-muted-foreground mt-1">Unable to load project details</p>
            </div>
            <Button asChild>
              <Link to="/projects">Go to Projects</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="border-4 border-primary/30 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Card className="w-full max-w-md p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h2 className="text-xl font-semibold">Error Loading Project</h2>
              <p className="text-muted-foreground mt-1">
                {!project ? `Project not found (ID: ${projectId})` : "An error occurred while fetching project data"}
              </p>
            </div>
            <Button asChild>
              <Link to="/projects">Go to Projects</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const createdDate = new Date(project.createdAt);
  const formattedDate = createdDate.toLocaleDateString();
  const formattedTime = createdDate.toLocaleTimeString();

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

  return (
    <>
      <div className="container mx-auto p-6 max-w-6xl space-y-8">
        {/* Project header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-gradient-to-r from-background via-background/80 to-muted/50 p-6 rounded-lg border shadow-sm">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link 
                to="/projects" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
              >
                <ArrowRightCircle className="h-3.5 w-3.5 mr-1 rotate-180" />
                Projects
              </Link>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{project.name}</span>
            </div>
            
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{project.name}</h1>
            
            {project.description && (
              <p className="text-muted-foreground max-w-2xl">{project.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="outline" className="font-mono text-xs">
                {project.id}
              </Badge>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formattedTime}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0 items-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEditProject} 
              className="transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDeleteProject} 
              className="transition-all hover:bg-destructive/90"
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              {isRefreshing ? (
                <span className="mr-2 border-2 border-primary/30 border-t-primary rounded-full w-4 h-4 animate-spin inline-block" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <div className="flex items-center ml-2">
              <span className="text-xs text-muted-foreground mr-2">Auto-refresh</span>
              <Switch
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
                disabled={isRefreshing}
                id="auto-refresh-toggle"
              />
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-primary/20">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Log Statistics
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      metrics?.totalLogs || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Total Logs</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      metrics?.todaysLogs || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Today's Logs</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-primary/20">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Error Summary
              </h3>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      metrics?.totalErrors || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">All Errors</div>
                </div>
                <div className="flex flex-col items-center justify-center p-4 rounded-lg border bg-background hover:border-primary/30 transition-colors">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? (
                      <span className="text-muted-foreground">...</span>
                    ) : (
                      metrics?.todaysErrors || 0
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Today's Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm overflow-hidden hover:shadow-md transition-all hover:border-primary/20">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Activity
              </h3>
            </div>
            <CardContent className="p-6 flex items-center justify-center">
              {isLoadingMetrics ? (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Loading activity...
                  </div>
                </div>
              ) : metrics?.lastActivity ? (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Last activity:
                  </div>
                  <div className="font-medium mt-1">
                    {new Date(metrics.lastActivity.timestamp).toLocaleString()}
                  </div>
                  <Badge 
                    className={`mt-2 ${
                      metrics.lastActivity.level === 'error' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : metrics.lastActivity.level === 'warn'
                        ? 'bg-amber-500 hover:bg-amber-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {metrics.lastActivity.level.toUpperCase()}
                  </Badge>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Last activity:
                  </div>
                  <div className="font-medium mt-1">
                    No recent activity
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
            </TabsList>
          </div>
          
          <TabsContent value="logs" className="mt-0">
            {/* Logs table with metadata filters */}
            <ProjectLogsTable projectId={project.id} />
          </TabsContent>
          
          <TabsContent value="metrics" className="mt-0">
            <ProjectMetricsTab projectId={project.id} />
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