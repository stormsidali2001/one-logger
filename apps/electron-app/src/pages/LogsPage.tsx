import { useState } from 'react';
import { useLogs } from '../hooks/queries/useLogs';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { Log } from '../types/log';

const columns: ColumnDef<Log>[] = [
  { accessorKey: 'projectId', header: 'Project ID' },
  { accessorKey: 'level', header: 'Level' },
  { accessorKey: 'message', header: 'Message' },
  { 
    accessorKey: 'timestamp', 
    header: 'Timestamp',
    cell: info => new Date(info.getValue() as string).toLocaleString()
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
    cell: info => {
      const metadata = info.getValue() as Log['metadata'];
      if (!metadata || metadata.length === 0) return null;
      
      return (
        <div className="font-mono text-xs text-muted-foreground whitespace-pre-wrap max-w-xs overflow-auto max-h-32">
          {metadata.map(meta => `${meta.key}: ${meta.value}`).join(', ')}
        </div>
      );
    },
  },
];

export default function LogsPage() {
  const [pageSize] = useState(20);
  const [cursor, setCursor] = useState<{ id: string; timestamp: string } | undefined>(undefined);
  const [paginationHistory, setPaginationHistory] = useState<{ id: string; timestamp: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(0);

  const { 
    data: logs = [], 
    isLoading, 
    isError,
    getNextCursor,
  } = useLogs({
    limit: pageSize,
    cursor,
    sortDirection: 'desc', // newest first
  });

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Go to next page
  const handleNextPage = () => {
    const nextCursor = getNextCursor();
    if (nextCursor && logs.length === pageSize) {
      // Save current cursor to history for back navigation
      if (cursor) {
        setPaginationHistory([...paginationHistory.slice(0, currentPage + 1), cursor]);
      } else {
        setPaginationHistory([...paginationHistory, { id: 'initial', timestamp: new Date().toISOString() }]);
      }
      
      setCursor(nextCursor);
      setCurrentPage(prev => prev + 1);
    }
  };

  // Go to previous page
  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevCursor = currentPage > 1 ? paginationHistory[currentPage - 1] : undefined;
      setCursor(prevCursor);
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2>All Logs</h2>
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}
      {isError && <div className="py-8 text-red-500">Error loading logs.</div>}
      
      {!isLoading && !isError && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {table.getHeaderGroups()[0].headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* Pagination controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {logs.length} logs
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePrevPage}
                disabled={currentPage === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextPage}
                disabled={logs.length < pageSize}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 