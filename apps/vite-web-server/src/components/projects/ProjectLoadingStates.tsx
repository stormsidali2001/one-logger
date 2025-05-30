import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function ProjectNotFound() {
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

export function ProjectLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
      <div className="flex flex-col items-center space-y-4">
        <div className="border-4 border-primary/30 border-t-primary rounded-full w-12 h-12 animate-spin"></div>
        <p className="text-muted-foreground">Loading project details...</p>
      </div>
    </div>
  );
}

interface ProjectErrorProps {
  projectId: string;
  project?: any;
}

export function ProjectError({ projectId, project }: ProjectErrorProps) {
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