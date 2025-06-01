import { Table as ReactTable, flexRender, type ColumnDef } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";
import type { TraceData } from "@one-logger/server-sdk";

interface ProjectTracesTableContentProps {
  table: ReactTable<TraceData>;
  columns: ColumnDef<TraceData>[];
  isLoading: boolean;
  isError: boolean;
  traces: TraceData[];
  selectedTraces: Record<string, boolean>;
  isFiltered: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function ProjectTracesTableContent({
  table,
  columns,
  isLoading,
  isError,
  traces,
  selectedTraces,
  isFiltered,
  onRetry,
  onClearFilters,
}: ProjectTracesTableContentProps) {
  if (isError) {
    return (
      <div className="border-t border-gray-100">
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading traces</h3>
          <p className="text-sm text-gray-500 mb-4 text-center">
            There was a problem loading the traces. Please try again.
          </p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-gray-100 bg-gray-50/50">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="font-semibold text-gray-700 py-4">
                  {header.isPlaceholder
                    ? null
                    : header.column.getCanSort()
                    ? (
                        <Button
                          variant="ghost"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-ml-4 h-auto p-0 hover:bg-transparent font-semibold text-gray-700 hover:text-gray-900"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === 'asc' && ' ↑'}
                          {header.column.getIsSorted() === 'desc' && ' ↓'}
                        </Button>
                      )
                    : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Dynamic loading skeleton based on actual traces or columns
            (traces.length > 0 ? traces : Array.from({ length: 5 })).map((_, index) => (
              <TableRow key={index} className="border-b border-gray-50">
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex} className="py-6">
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow 
                key={row.id} 
                data-state={selectedTraces[row.original.id] ? 'selected' : undefined}
                className={`
                  ${index % 2 === 0 ? "bg-white/60" : "bg-gray-50/60"} 
                  ${selectedTraces[row.original.id] ? "bg-gradient-to-r from-blue-50/80 to-blue-100/60 border-l-4 border-blue-500 shadow-sm" : ""}
                  hover:bg-gradient-to-r hover:from-blue-50/70 hover:to-blue-100/50 hover:shadow-md hover:scale-[1.01] transition-all duration-300 border-b border-gray-200/60
                  data-[state=selected]:bg-gradient-to-r data-[state=selected]:from-blue-50/80 data-[state=selected]:to-blue-100/60
                  cursor-pointer
                `}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id} 
                    className="py-5 px-6 text-gray-900"
                    style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <Activity className="h-12 w-12 text-gray-300" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isFiltered ? "No traces match your filters" : "No traces found"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFiltered 
                        ? "Try adjusting your search or filters" 
                        : "Traces will appear here when they are created"
                      }
                    </p>
                  </div>
                  {isFiltered && (
                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}