import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface ProjectTracesTableHeaderProps {
  sortDirection: 'asc' | 'desc';
  onToggleSortDirection: () => void;
  displayedTraceCount?: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ProjectTracesTableHeader({
  sortDirection,
  onToggleSortDirection,
  displayedTraceCount,
  isLoading,
  onRefresh,
}: ProjectTracesTableHeaderProps) {
  return (
    <div className="flex items-center justify-between p-6 pb-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">Traces</h3>
        </div>
        <p className="text-sm text-gray-600">
          {isLoading ? (
            "Loading traces..."
          ) : displayedTraceCount !== undefined ? (
            <>
              {displayedTraceCount} trace{displayedTraceCount !== 1 ? 's' : ''} found
              {displayedTraceCount > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  • Last updated {formatDistanceToNow(new Date(), { addSuffix: true })}
                </span>
              )}
            </>
          ) : (
            "Traces"
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleSortDirection}
          className="border-gray-200 hover:bg-gray-50"
        >
          Sort {sortDirection === 'desc' ? '↓' : '↑'}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="border-gray-200 hover:bg-gray-50"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
}