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
import type { Log } from '@one-logger/server-sdk';
import { CardContent, Card } from '@/components/ui/card';
import { Loader2, AlertCircle, Search as SearchIcon, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectLogsLoadingStateProps {}
const ProjectLogsLoadingState: React.FC<ProjectLogsLoadingStateProps> = () => (
  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Loading logs...</h3>
          <p className="text-sm text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ProjectLogsErrorStateProps {
  onRetry: () => void;
}
const ProjectLogsErrorState: React.FC<ProjectLogsErrorStateProps> = ({ onRetry }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-red-200 shadow-lg rounded-xl">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 bg-gradient-to-r from-red-100 to-orange-100 rounded-full">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Error loading logs</h3>
          <p className="text-sm text-gray-600 mb-4">Something went wrong while fetching your data</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="bg-white/80 hover:bg-red-50 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ProjectLogsEmptyStateProps {
  isFiltered: boolean;
  onClearFilters: () => void;
}
const ProjectLogsEmptyState: React.FC<ProjectLogsEmptyStateProps> = ({ isFiltered, onClearFilters }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg rounded-xl">
    <CardContent className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-6 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full">
          <SearchIcon className="h-12 w-12 text-gray-500" />
        </div>
        <div>
          <h3 className="font-semibold text-xl text-gray-900 mb-2">No logs found</h3>
          <p className="text-gray-600 max-w-md mb-4">
            {isFiltered
              ? "Try adjusting your filters or search criteria to see more results."
              : "There are no logs recorded for this project yet. Start logging to see data here."}
          </p>
          {isFiltered && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="bg-white/80 hover:bg-blue-50 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
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
    <div className="rounded-xl border border-gray-200/50 m-0 md:m-4 overflow-hidden bg-white/60 backdrop-blur-sm shadow-lg">
      <Table>
        <TableHeader className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="border-b border-gray-200/50">
              {headerGroup.headers.map(header => (
                <TableHead 
                  key={header.id} 
                  className="font-bold whitespace-nowrap text-gray-800 py-5 px-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b-2 border-blue-200" 
                  style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                >
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
                  ${i % 2 === 0 ? "bg-white/60" : "bg-gray-50/60"} 
                  ${selectedLogs[row.original.id] ? "bg-gradient-to-r from-blue-50/80 to-blue-100/60 border-l-4 border-blue-500 shadow-sm" : ""}
                  hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-100/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 border-b border-gray-200/60
                  data-[state=selected]:bg-gradient-to-r data-[state=selected]:from-blue-50/80 data-[state=selected]:to-blue-100/60
                  cursor-pointer
                `}
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell 
                    key={cell.id} 
                    className="py-5 px-6 text-gray-900"
                    style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            // This case should ideally be covered by the logs.length === 0 check above
            // but kept for safety / direct table empty state handling.
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-gray-600">
                No results found for the current filter criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}