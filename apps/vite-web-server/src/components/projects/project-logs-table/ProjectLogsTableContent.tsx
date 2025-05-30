import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from '@/components/ui/table';
import {
  flexRender,
 type Table as TanstackTable,
  type ColumnDef
} from '@tanstack/react-table';
import type { Log } from '@/types/log';
import { CardContent, Card } from '@/components/ui/card';
import { Loader2, AlertCircle, Search as SearchIcon, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectLogsLoadingStateProps {}
const ProjectLogsLoadingState: React.FC<ProjectLogsLoadingStateProps> = () => (
  <Card className="border shadow-sm rounded-none md:rounded-md">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">Loading logs...</span>
      </div>
    </CardContent>
  </Card>
);

interface ProjectLogsErrorStateProps {
  onRetry: () => void;
}
const ProjectLogsErrorState: React.FC<ProjectLogsErrorStateProps> = ({ onRetry }) => (
  <Card className="border shadow-sm rounded-none md:rounded-md">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-2">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <span className="text-sm text-destructive">Error loading logs</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </CardContent>
  </Card>
);

interface ProjectLogsEmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
}
const ProjectLogsEmptyState: React.FC<ProjectLogsEmptyStateProps> = ({ isFiltered, onClearFilters }) => (
  <Card className="border shadow-sm rounded-none md:rounded-md">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-2">
        <div className="rounded-full bg-muted p-4">
          <SearchIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">No logs found</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {isFiltered
            ? "Try adjusting your filters or search criteria to see more results."
            : "There are no logs recorded for this project yet."}
        </p>
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
);

interface ProjectLogsTableContentProps {
  table: TanstackTable<Log>;
  columns: ColumnDef<Log>[]; // Re-pass columns for colSpan calculation in empty state
  isLoading: boolean;
  isError: boolean;
  logs: Log[];
  selectedLogs: Record<string, boolean>;
  isFiltered: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function ProjectLogsTableContent({
  table,
  columns,
  isLoading,
  isError,
  logs,
  selectedLogs,
  isFiltered,
  onRetry,
  onClearFilters,
}: ProjectLogsTableContentProps) {
  if (isLoading) {
    return <ProjectLogsLoadingState />;
  }

  if (isError) {
    return <ProjectLogsErrorState onRetry={onRetry} />;
  }

  if (logs.length === 0) {
    return <ProjectLogsEmptyState isFiltered={isFiltered} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="rounded-md border border-border/50 m-0 md:m-4 overflow-hidden">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id} className="font-semibold whitespace-nowrap" style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row, i) => (
              <TableRow
                key={row.id}
                data-state={selectedLogs[row.original.id] ? 'selected' : undefined}
                className={`
                  ${i % 2 === 0 ? "bg-background" : "bg-muted/30"} 
                  ${selectedLogs[row.original.id] ? "bg-primary/5" : ""}
                  hover:bg-primary/10 data-[state=selected]:bg-primary/10
                `}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            // This case should ideally be covered by the logs.length === 0 check above
            // but kept for safety / direct table empty state handling.
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found for the current filter criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 