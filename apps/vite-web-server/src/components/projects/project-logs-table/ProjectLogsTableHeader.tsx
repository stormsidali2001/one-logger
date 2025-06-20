import { CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Filter,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide
} from 'lucide-react';
import type { LogsFilterState } from './LogsFilterModal'; // Adjust path as needed
import type { SortDirection } from './useProjectLogsSort'; // Assuming this is in the same directory

interface ProjectLogsTableHeaderProps {
  filters: LogsFilterState;
  sortDirection: SortDirection;
  onOpenFilterModal: () => void;
  onToggleSortDirection: () => void;
  displayedLogCount?: number; // Renamed from totalLogsCount
  isLoading: boolean;
}

export function ProjectLogsTableHeader({
  filters,
  sortDirection,
  onOpenFilterModal,
  onToggleSortDirection,
  displayedLogCount, // Renamed
  isLoading
}: ProjectLogsTableHeaderProps) {

  return (
    <CardHeader className="px-6 py-4 border-b bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <CardTitle className="text-xl font-bold">Project Logs</CardTitle>
          {/* Active filter badges */}
          <div className="flex flex-wrap gap-2 mt-2">
            {filters.levels.length > 0 && (
              <Badge variant="outline">Levels: {filters.levels.join(", ")}</Badge>
            )}
            {filters.fromDate && (
              <Badge variant="outline">From: {new Date(filters.fromDate).toLocaleDateString()}</Badge>
            )}
            {filters.toDate && (
              <Badge variant="outline">To: {new Date(filters.toDate).toLocaleDateString()}</Badge>
            )}
            {filters.metadata.map((meta, idx) => (
              <Badge key={idx} variant="outline" className="truncate max-w-xs">
                {meta.key}: {meta.value}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={onOpenFilterModal}
            aria-label="Open filters"
            disabled={isLoading}
          >
            <Filter className="h-5 w-5" />
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleSortDirection}
                  className="h-9 min-w-[140px] justify-between tabular-nums"
                  disabled={isLoading}
                >
                  <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
                  {sortDirection === 'desc'
                    ? <ArrowDownNarrowWide className="h-4 w-4 ml-2" />
                    : <ArrowUpNarrowWide className="h-4 w-4 ml-2" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Change sort order</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {/* Displayed log count for the current view (page / filters) */}
          {displayedLogCount !== undefined && !isLoading && (
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              {displayedLogCount} log{displayedLogCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}