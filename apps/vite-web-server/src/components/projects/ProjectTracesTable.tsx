//@ts-nocheck
import { useState, useMemo, useCallback } from "react";
import { useTracesByProjectId } from "@/hooks/queries/traces/useTracesByProjectId";
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import type { TraceData } from "@one-logger/server-sdk";

// Modularized Imports
import { useProjectTracesFilters } from "./project-traces-table/useProjectTracesFilters";
import { useProjectTracesSelection } from "./project-traces-table/useProjectTracesSelection";
import { useProjectTracesSort } from "./project-traces-table/useProjectTracesSort";
import { useTraceDetailSheet } from "./project-traces-table/useTraceDetailSheet";
import { ProjectTracesTableHeader } from "./project-traces-table/ProjectTracesTableHeader";
import { ProjectTracesTableToolbar } from "./project-traces-table/ProjectTracesTableToolbar";
import { ProjectTracesTableContent } from "./project-traces-table/ProjectTracesTableContent";
import { ProjectTracesTableFooter } from "./project-traces-table/ProjectTracesTableFooter";
import { TracesFilterModal } from "./project-traces-table/TracesFilterModal";
import { TraceDetailSheet } from "./project-traces-table/TraceDetailSheet";
import { useProjectTracesPagination } from "./project-traces-table/useProjectTracesPagination";
import { getProjectTracesTableColumns } from "./project-traces-table/projectTracesTableColumns";

interface ProjectTracesTableProps {
  projectId: string;
}

const DEBOUNCE_TIMEOUT = 500; // ms
const PAGE_SIZE = 20;

export function ProjectTracesTable({ projectId }: ProjectTracesTableProps) {
  // --- HOOKS ---
  const {
    searchQuery, // This is now the DEBOUNCED query
    inputValue,  // This is the IMMEDIATE value from the input
    setSearchQuery: setInputValue, // Renamed for clarity, this sets the immediate input value
    filterModalOpen,
    openFilterModal,
    setFilterModalOpen,
    filters,
    handleApplyFilters: applyFiltersFromModal,
    handleResetFilters: resetFiltersFromModal,
    filtersActive,
  } = useProjectTracesFilters({ debounceTimeout: DEBOUNCE_TIMEOUT });

  const {
    sortDirection,
    sorting,
    handleToggleSortDirection,
    setSorting, // from useProjectTracesSort
    resetSort,
  } = useProjectTracesSort('desc');

  const {
    cursor,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetPagination,
  } = useProjectTracesPagination(PAGE_SIZE);

  const {
    isDetailSheetOpen,
    currentTraceDetail,
    openDetailSheet,
    setIsDetailSheetOpen, // from useTraceDetailSheet
  } = useTraceDetailSheet();

  // This local columnFilters state is for TanStack Table's internal filtering if ever used.
  // Currently, filtering logic is mostly handled by the query options.
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // --- DATA FETCHING ---
  const projectTracesOptions = {
    limit: PAGE_SIZE,
    sortDirection,
    ...(filters.status.length > 0 ? { status: filters.status } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
    ...(filters.minDuration !== undefined ? { minDuration: filters.minDuration } : {}),
    ...(filters.maxDuration !== undefined ? { maxDuration: filters.maxDuration } : {}),
    // Use the debounced searchQuery for API calls
    ...(searchQuery ? { nameContains: searchQuery } : {}),
    ...(cursor ? { cursor } : {}),
  };

  const { data, isLoading, error, refetch } = useTracesByProjectId(projectId, projectTracesOptions);
  const traces = useMemo(() => data?.traces || [], [data]);
  const hasNextPage = data?.hasNextPage || false;
  
  const getNextCursor = useCallback(() => {
    if (hasNextPage && traces.length > 0) {
      const latestTrace = traces[traces.length - 1];
      return {
        id: latestTrace.id,
        timestamp: latestTrace.startTime,
      };
    }
    return null;
  }, [hasNextPage, traces]);

  const {
    selectedTraces,
    selectedCount,
    handleSelectAll,
    handleSelectRow,
    resetSelection,
  } = useProjectTracesSelection(traces); // Pass current page traces to hook

  // --- CALLBACKS & EVENT HANDLERS ---
  const handleApplyFiltersAndReset = useCallback((newFilters: Parameters<typeof applyFiltersFromModal>[0]) => {
    applyFiltersFromModal(newFilters);
    resetPagination();
    resetSelection();
    // Data will refetch due to projectTracesOptions dependency change
  }, [applyFiltersFromModal, resetPagination, resetSelection]);

  const handleResetFiltersAndReset = useCallback(() => {
    resetFiltersFromModal();
    resetPagination();
    resetSort(); // Optionally reset sort to default
    resetSelection();
    // Data will refetch
  }, [resetFiltersFromModal, resetPagination, resetSort, resetSelection]);

  const handleToggleSortAndReset = useCallback(() => {
    handleToggleSortDirection();
    resetPagination();
    resetSelection();
    // Data will refetch
  }, [handleToggleSortDirection, resetPagination, resetSelection]);

  const onNextPageHandler = useCallback(() => {
    const nextCursor = getNextCursor();
    if (nextCursor) {
      handleNextPage(nextCursor); // Pass the next cursor directly
    }
  }, [handleNextPage, getNextCursor]);

  const onPrevPageHandler = useCallback(() => {
    handlePrevPage();
  }, [handlePrevPage]);

  const handleRefresh = useCallback(() => {
    resetPagination(); // Reset pagination before refetch
    refetch();
  }, [resetPagination, refetch]);

  // --- TRACE ACTIONS ---
  const handleViewTrace = useCallback((trace: TraceData) => {
    openDetailSheet(trace);
  }, [openDetailSheet]);

  const handleDeleteTrace = useCallback((traceId: string) => {
    toast.info(`Mock Deleting trace ${traceId}...`, {
      description: "This is a placeholder. Actual deletion would be implemented here."
    });
    // API call to delete trace by traceId
    // After successful deletion: refetch(), resetSelection()
  }, []);

  // --- BATCH ACTIONS ---
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(selectedTraces).filter(id => selectedTraces[id]);
    toast.info(`Mock Deleting ${selectedIds.length} traces...`, {
      description: "This is a placeholder. Actual deletion would be implemented here."
    });
    // API call to delete traces by selectedIds
    // After successful deletion: refetch(), resetSelection()
    resetSelection(); // For now, just reset selection
  };
  
  const handleExportSelected = () => {
    const selectedIds = Object.keys(selectedTraces).filter(id => selectedTraces[id]);
    toast.info(`Mock Exporting ${selectedIds.length} traces...`, {
      description: "This is a placeholder. Actual export would be implemented here."
    });
    // Logic to export selectedTraceItems
  };
  
  const handleCopySelected = () => {
    const selectedIds = Object.keys(selectedTraces).filter(id => selectedTraces[id]);
    const selectedTraceItems = traces.filter(trace => selectedIds.includes(trace.id));
    const textToCopy = selectedTraceItems.map(trace => {
      return `[${new Date(trace.startTime).toLocaleString()}] ${trace.name} (${trace.id})`;
    }).join('\n');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success(`Copied ${selectedIds.length} traces to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy traces to clipboard");
      });
  };

  // --- TABLE SETUP ---
  const columns = useMemo(() => getProjectTracesTableColumns({
    selectedTraces,
    onSelectAll: (checked) => handleSelectAll(checked), // Pass current traces to selectAll
    onSelectRow: handleSelectRow,
    onViewTrace: handleViewTrace,
    onDeleteTrace: handleDeleteTrace,
    currentTraces: traces,
  }), [selectedTraces, handleSelectAll, handleSelectRow, handleViewTrace, handleDeleteTrace, traces]);

  const table = useReactTable({
    data: traces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // For client-side filtering if enabled
    onSortingChange: setSorting, // From useProjectTracesSort
    onColumnFiltersChange: setColumnFilters, // Local state for TanStack's internal filters
    state: {
      sorting, // From useProjectTracesSort
      columnFilters, // Local state
      // rowSelection: selectedTraces, // TanStack table can manage selection, but we do it manually for now
    },
    manualPagination: true, // Since we handle pagination logic
    manualSorting: true,    // Since we handle sorting via query options
    manualFiltering: true,  // Since we handle filtering via query options (mostly)
    enableRowSelection: true, // Enable row selection features
    onRowSelectionChange: () => {
        // This is if you want tanstack table to control the selectedTraces state.
        // We are doing it manually via useProjectTracesSelection for now.
        // If 'updater' is a function: setSelectedTraces(updater(selectedTraces));
        // Else: setSelectedTraces(updater);
    },
    debugTable: process.env.NODE_ENV === 'development',
  });



  // --- RENDER ---
  return (
    <>
      <TracesFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        filters={filters}
        onApply={handleApplyFiltersAndReset}
        onReset={handleResetFiltersAndReset}
        projectId={projectId}
      />
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg w-full">
        <ProjectTracesTableHeader
          sortDirection={sortDirection}
          onToggleSortDirection={handleToggleSortAndReset}
          displayedTraceCount={!isLoading ? traces.length : undefined}
          isLoading={isLoading}
          onRefresh={handleRefresh}
        />
        <ProjectTracesTableToolbar
          searchQuery={inputValue} // Pass inputValue to display in toolbar
          onSearchQueryChange={setInputValue} // Pass setInputValue to update immediate input
          onOpenFilterModal={openFilterModal}
          selectedCount={selectedCount}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={handleExportSelected}
          onCopySelected={handleCopySelected}
          isLoading={isLoading}
        />
        <ProjectTracesTableContent
          table={table}
          columns={columns}
          isLoading={isLoading}
          isError={!!error}
          traces={traces}
          selectedTraces={selectedTraces}
          isFiltered={filtersActive || !!searchQuery} // isFiltered depends on debounced searchQuery
          onRetry={handleRefresh}
          onClearFilters={handleResetFiltersAndReset}
        />
        <ProjectTracesTableFooter
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPrevPage={onPrevPageHandler}
          onNextPage={onNextPageHandler}
          isLoading={isLoading}
          currentTraceCount={traces.length}
          pageSize={PAGE_SIZE}
        />
      </Card>
      <TraceDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        trace={currentTraceDetail}
      />
    </>
  );
}