import React, { useState, useEffect } from "react";
import { useLogsByProjectId, ProjectLogsOptions, getNextCursor } from "@/hooks/queries/useLogsByProjectId";
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  ColumnDef,
  getSortedRowModel, 
  SortingState,
  getFilteredRowModel, 
  ColumnFiltersState,
  Row
} from '@tanstack/react-table';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Log, LogCursor } from "@/types/log";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  RefreshCw,
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  X,
  AlertCircle,
  SlidersHorizontal,
  ChevronRight as ChevronRightIcon,
  Trash,
  Download,
  Copy,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LogDetailSheet } from "./LogDetailSheet";

interface ProjectLogsTableProps {
  projectId: string;
}

type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace';
const LOG_LEVELS: LogLevel[] = ['error', 'warn', 'info', 'debug', 'trace'];

export function ProjectLogsTable({ projectId }: ProjectLogsTableProps) {
  // Pagination state
  const [pageSize] = useState(20);
  const [cursor, setCursor] = useState<LogCursor | undefined>(undefined);
  const [paginationHistory, setPaginationHistory] = useState<LogCursor[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // newest first by default
  
  // Local table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: sortDirection === 'desc' }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  // Selection state
  const [selectedLogs, setSelectedLogs] = useState<Record<string, boolean>>({});
  const [selectedCount, setSelectedCount] = useState(0);
  
  // Detail view state
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [currentLogDetail, setCurrentLogDetail] = useState<Log | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filtersActive, setFiltersActive] = useState(false);
  const [filters, setFilters] = useState<ProjectLogsOptions>({
    limit: pageSize,
    sortDirection,
  });
  
  // Update selection count whenever selectedLogs changes
  useEffect(() => {
    const count = Object.values(selectedLogs).filter(Boolean).length;
    setSelectedCount(count);
  }, [selectedLogs]);
  
  // Reset selection when page changes
  useEffect(() => {
    setSelectedLogs({});
  }, [currentPage]);
  
  // Update table filters when search changes
  useEffect(() => {
    // This sets the filter for the tanstack table local filtering
    table.getColumn('message')?.setFilterValue(searchQuery);
  }, [searchQuery]);
  
  // Apply filters
  const handleApplyFilters = () => {
    const newFilters: ProjectLogsOptions = {
      limit: pageSize,
      sortDirection,
    };
    
    if (searchQuery) {
      newFilters.messageContains = searchQuery;
    }
    
    if (selectedLevels.length > 0) {
      newFilters.level = selectedLevels;
    }
    
    if (fromDate) {
      newFilters.fromDate = fromDate;
    }
    
    if (toDate) {
      newFilters.toDate = toDate;
    }
    
    // Reset pagination when filters change
    setCursor(undefined);
    setPaginationHistory([]);
    setCurrentPage(0);
    
    setFilters(newFilters);
    setFiltersActive(searchQuery !== "" || selectedLevels.length > 0 || fromDate !== "" || toDate !== "");
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedLevels([]);
    setFromDate("");
    setToDate("");
    
    // Reset pagination
    setCursor(undefined);
    setPaginationHistory([]);
    setCurrentPage(0);
    
    // Apply minimal filters with pagination defaults
    setFilters({
      limit: pageSize,
      sortDirection,
    });
    
    setFiltersActive(false);
  };

  // Toggle sort direction
  const handleToggleSortDirection = () => {
    const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newDirection);
    setSorting([{ id: 'timestamp', desc: newDirection === 'desc' }]);
    
    // Reset pagination
    setCursor(undefined);
    setPaginationHistory([]);
    setCurrentPage(0);
    
    // Update filters with new sort direction
    setFilters({
      ...filters,
      sortDirection: newDirection,
    });
  };

  // Navigation handlers
  const handleNextPage = () => {
    if (logs && logs.length === pageSize) {
      const nextCursor = getNextCursor(logs);
      if (nextCursor) {
        if (cursor) {
          setPaginationHistory([...paginationHistory.slice(0, currentPage + 1), cursor]);
        } else {
          setPaginationHistory([...paginationHistory, { id: 'initial', timestamp: new Date().toISOString() }]);
        }
        
        setCursor(nextCursor);
        setCurrentPage(prev => prev + 1);
        setFilters({
          ...filters,
          cursor: nextCursor,
        });
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevCursor = currentPage > 1 ? paginationHistory[currentPage - 1] : undefined;
      setCursor(prevCursor);
      setCurrentPage(prev => prev - 1);
      
      setFilters({
        ...filters,
        cursor: prevCursor,
      });
    }
  };
  
  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (!logs) return;
    
    const newSelected = { ...selectedLogs };
    
    if (checked) {
      // Select all logs on current page
      logs.forEach(log => {
        newSelected[log.id] = true;
      });
    } else {
      // Deselect all logs on current page
      logs.forEach(log => {
        delete newSelected[log.id];
      });
    }
    
    setSelectedLogs(newSelected);
  };
  
  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedLogs(prev => ({
      ...prev,
      [id]: checked,
    }));
  };
  
  // Batch action handlers
  const handleDeleteSelected = () => {
    // This would be replaced with actual deletion logic
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    toast.info(`Deleted ${selectedIds.length} logs`, {
      description: "This is a placeholder. Actual deletion would be implemented here."
    });
    setSelectedLogs({});
  };
  
  const handleExportSelected = () => {
    // This would be replaced with actual export logic
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    toast.info(`Exported ${selectedIds.length} logs`, {
      description: "This is a placeholder. Actual export would be implemented here."
    });
  };
  
  const handleCopySelected = () => {
    if (!logs) return;
    
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    const selectedLogItems = logs.filter(log => selectedIds.includes(log.id));
    
    const textToCopy = selectedLogItems.map(log => {
      return `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`;
    }).join('\n');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success(`Copied ${selectedIds.length} logs to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy logs to clipboard");
      });
  };
  
  // Detail sheet handlers
  const openDetailSheet = (log: Log) => {
    setCurrentLogDetail(log);
    setIsDetailSheetOpen(true);
  };

  // Fetch logs with filters and pagination
  const { data: logs, isLoading, isError } = useLogsByProjectId(projectId, filters);

  const getLevelBadgeColor = (level: string): string => {
    switch(level.toLowerCase()) {
      case 'error': return "bg-red-500 hover:bg-red-600";
      case 'warn': return "bg-amber-500 hover:bg-amber-600";
      case 'info': return "bg-blue-500 hover:bg-blue-600";
      case 'debug': return "bg-green-500 hover:bg-green-600";
      case 'trace': return "bg-slate-400 hover:bg-slate-500";
      default: return "bg-slate-400 hover:bg-slate-500";
    }
  };

  const columns: ColumnDef<Log>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox 
          checked={
            logs && logs.length > 0 && 
            logs.every(log => selectedLogs[log.id])
          }
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox 
          checked={!!selectedLogs[row.original.id]}
          onCheckedChange={(checked) => handleSelectRow(row.original.id, !!checked)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    { 
      accessorKey: 'timestamp', 
      header: 'Timestamp',
      cell: info => {
        const date = new Date(info.getValue() as string);
        return (
          <div className="text-sm">
            <div className="font-medium">{date.toLocaleDateString()}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
          </div>
        );
      }
    },
    { 
      accessorKey: 'level', 
      header: 'Level',
      cell: info => {
        const level = info.getValue() as string;
        const badgeClass = getLevelBadgeColor(level);
        
        return (
          <Badge className={`${badgeClass} font-medium px-2 py-1`}>
            {level.toUpperCase()}
          </Badge>
        );
      }
    },
    { 
      accessorKey: 'message', 
      header: 'Message',
      cell: info => (
        <div className="font-mono text-sm whitespace-pre-wrap max-w-xl py-2">
          {info.getValue() as string}
        </div>
      )
    },
    {
      accessorKey: 'metadata',
      header: 'Metadata',
      cell: info => {
        const metadata = info.getValue() as Log['metadata'];
        if (!metadata || metadata.length === 0) return null;
        
        // Only show first 2 metadata fields in the table
        const visibleMetadata = metadata.slice(0, 2);
        const hasMore = metadata.length > 2;
        
        return (
          <div>
            <div className="font-mono text-xs bg-muted rounded p-2 whitespace-pre-wrap max-w-xs overflow-auto max-h-32">
              {visibleMetadata.map(meta => (
                <div key={meta.key} className="mb-1">
                  <span className="text-muted-foreground">{meta.key}:</span>{" "}
                  <span>{meta.value}</span>
                </div>
              ))}
              {hasMore && (
                <div className="text-muted-foreground text-xs mt-1">
                  +{metadata.length - 2} more...
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const log = row.original;
        
        return (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openDetailSheet(log)}
            className="rounded-full hover:bg-primary/10"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </Button>
        );
      },
    }
  ];

  const table = useReactTable({
    data: logs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  if (isLoading) return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading logs...</span>
        </div>
      </CardContent>
    </Card>
  );
  
  if (isError) return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <span className="text-sm text-destructive">Error loading logs</span>
          <Button variant="outline" size="sm" onClick={() => handleResetFilters()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
  
  if (!logs || logs.length === 0) return (
    <Card className="border shadow-sm">
      <CardContent className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="rounded-full bg-muted p-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg">No logs found</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {filtersActive 
              ? "Try adjusting your filters or search criteria to see more results."
              : "There are no logs recorded for this project yet."}
          </p>
          {filtersActive && (
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <Card className="border shadow-sm">
        <CardHeader className="px-6 py-4 border-b bg-card">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl font-bold">Project Logs</CardTitle>
              {filtersActive && (
                <div className="text-sm text-muted-foreground mt-1">
                  Filtered results • {logs.length} logs
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleToggleSortDirection}
                      className="h-9 min-w-32 justify-between"
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
              
              {!filtersActive && (
                <div className="text-sm text-muted-foreground">
                  {logs.length} logs
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <div className="border-t border-border/50 bg-card/80">
          <div className="p-4 space-y-4">
            {/* Batch actions (visible when items are selected) */}
            {selectedCount > 0 && (
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md border border-border/40">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-semibold">
                    {selectedCount} selected
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedLogs({})}
                    className="h-8"
                  >
                    Clear selection
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleCopySelected}
                    className="h-8"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportSelected}
                    className="h-8"
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleDeleteSelected}
                    className="h-8"
                  >
                    <Trash className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
            
            {/* Unified search bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search log messages..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="h-10 pl-8 pr-14"
                  onKeyUp={(e) => {
                    if (e.key === 'Enter') {
                      handleApplyFilters();
                    }
                  }}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 hover:bg-muted rounded-full"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                  {searchQuery && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 hover:bg-muted rounded-full"
                      onClick={() => {
                        setSearchQuery("");
                        if (filtersActive) handleApplyFilters();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  className="h-10" 
                  onClick={handleApplyFilters}
                >
                  Search
                </Button>
                
                {filtersActive && (
                  <Button 
                    variant="outline" 
                    className="h-10" 
                    onClick={handleResetFilters}
                  >
                    Reset
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced filters (collapsible) */}
            {showAdvancedFilters && (
              <div className="flex flex-wrap gap-4 items-end bg-muted/20 rounded-md p-4 border border-border/40">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Log Level</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="default" className="h-10">
                        <Filter className="h-4 w-4 mr-2" />
                        {selectedLevels.length 
                          ? `${selectedLevels.length} selected` 
                          : "All Levels"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {LOG_LEVELS.map(level => (
                        <DropdownMenuCheckboxItem
                          key={level}
                          checked={selectedLevels.includes(level)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedLevels([...selectedLevels, level]);
                            } else {
                              setSelectedLevels(selectedLevels.filter(l => l !== level));
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <Badge className={`${getLevelBadgeColor(level)} w-12 justify-center mr-2`}>
                              {level}
                            </Badge>
                            <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
                          </div>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={e => setFromDate(e.target.value)}
                      className="h-10 w-[140px]"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={e => setToDate(e.target.value)}
                      className="h-10 w-[140px]"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter info */}
            {filtersActive && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Active filters:
                </span>
                {searchQuery && (
                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                    Query: {searchQuery}
                  </Badge>
                )}
                {selectedLevels.length > 0 && (
                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                    Levels: {selectedLevels.join(', ')}
                  </Badge>
                )}
                {fromDate && (
                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                    From: {fromDate}
                  </Badge>
                )}
                {toDate && (
                  <Badge variant="outline" className="px-2 py-0.5 text-xs font-normal">
                    To: {toDate}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="rounded-md border border-border/50 m-4 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                {table.getHeaderGroups()[0].headers.map(header => (
                  <TableHead key={header.id} className="font-semibold">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row, i) => (
                  <TableRow 
                    key={row.id} 
                    className={`${i % 2 === 0 ? "bg-background" : "bg-muted/30"} ${selectedLogs[row.original.id] ? "bg-primary/5" : ""} hover:bg-primary/5`}
                  >
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
        </div>
        
        <CardFooter className="border-t p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground order-2 sm:order-1">
            {logs.length > 0 ? (
              <>
                Page {currentPage + 1}
                {logs.length === pageSize && <span className="text-muted-foreground/60"> • More logs available</span>}
              </>
            ) : (
              <>No logs available</>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="h-9 px-3"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextPage}
              disabled={!logs || logs.length < pageSize}
              className="h-9 px-3"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Log Detail Sheet - replacing the Dialog */}
      <LogDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        log={currentLogDetail}
      />
    </>
  );
} 