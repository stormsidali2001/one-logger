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
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg overflow-hidden hover:shadow-xl transition-all hover:border-primary/20">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-b border-gray-200/50">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white">
              <FileText className="h-3 w-3" />
            </div>
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
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg overflow-hidden hover:shadow-xl transition-all hover:border-primary/20">
        <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 p-4 border-b border-gray-200/50">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-red-500 to-orange-500 rounded text-white">
              <AlertCircle className="h-3 w-3" />
            </div>
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
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg overflow-hidden hover:shadow-xl transition-all hover:border-primary/20">
        <div className="bg-gradient-to-r from-green-500/10 to-teal-500/10 p-4 border-b border-gray-200/50">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-green-500 to-teal-500 rounded text-white">
              <BarChart3 className="h-3 w-3" />
            </div>
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