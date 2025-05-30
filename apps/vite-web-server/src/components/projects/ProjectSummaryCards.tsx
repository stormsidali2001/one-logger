import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  BarChart3, 
  AlertCircle
} from "lucide-react";

interface ProjectMetrics {
  totalLogs?: number;
  todaysLogs?: number;
  totalErrors?: number;
  todaysErrors?: number;
  lastActivity?: {
    timestamp: string;
    level: string;
  };
}

interface ProjectSummaryCardsProps {
  metrics?: ProjectMetrics;
  isLoadingMetrics: boolean;
}

export function ProjectSummaryCards({ metrics, isLoadingMetrics }: ProjectSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Log Statistics Card */}
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
      
      {/* Error Summary Card */}
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
      
      {/* Activity Card */}
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
  );
}