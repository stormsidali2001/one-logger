import  { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectMetricsTabProps {
  projectId: string;
}



export function ProjectMetricsTab({ projectId }: ProjectMetricsTabProps) {
  const isLoadingMetrics = false; // Placeholder since we removed metrics loading
      color: "#f59e0b",
    },
    error: {
      label: "Errors",
      color: "#ef4444",
    },
  };

  const isLoading = isLoadingMetrics || isLoadingHistorical;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No metrics available</p>
      </div>
    );
  }



  return (
    <div className="space-y-10">


      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Metrics</h3>
          <p className="text-gray-500">Non-log related metrics will be displayed here</p>
        </div>
      </div>

    </div>
  );
}