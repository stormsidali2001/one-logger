import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLogsByProjectId, ProjectLogsOptions } from "@/hooks/queries/useLogsByProjectId";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnFiltersState, // Keep for table instance if needed directly
} from '@tanstack/react-table';
import { Card } from "@/components/ui/card";
import { Log, MetadataFilter as GlobalMetadataFilter } from "@/types/log"; // Renamed to avoid conflict
import { toast } from "sonner";

// Modularized Imports
import { useProjectLogsFilters } from "./project-logs-table/useProjectLogsFilters";
import { useProjectLogsSelection } from "./project-logs-table/useProjectLogsSelection";
import { useProjectLogsPagination } from "./project-logs-table/useProjectLogsPagination";
import { useProjectLogsSort } from "./project-logs-table/useProjectLogsSort";
import { useLogDetailSheet } from "./project-logs-table/useLogDetailSheet";
import { getProjectLogsTableColumns } from "./project-logs-table/projectLogsTableColumns";
import { ProjectLogsTableHeader } from "./project-logs-table/ProjectLogsTableHeader";
import { ProjectLogsTableToolbar } from "./project-logs-table/ProjectLogsTableToolbar";
import { ProjectLogsTableContent } from "./project-logs-table/ProjectLogsTableContent";
import { ProjectLogsTableFooter } from "./project-logs-table/ProjectLogsTableFooter";
import { LogsFilterModal } from "./project-logs-table/LogsFilterModal";
import { LogDetailSheet } from "./project-logs-table/LogDetailSheet";

interface ProjectLogsTableProps {
  projectId: string;
  // metadataFilters prop is now handled by the useProjectLogsFilters hook if needed as initial state
}

const PAGE_SIZE = 20;

export function ProjectLogsTable({ projectId }: ProjectLogsTableProps) {
  // --- HOOKS ---
  const {
    searchQuery,
    setSearchQuery,
    filterModalOpen,
    openFilterModal,
    setFilterModalOpen,
    filters,
    handleApplyFilters: applyFiltersFromModal,
    handleResetFilters: resetFiltersFromModal,
    filtersActive,
  } = useProjectLogsFilters();

  const {
    sortDirection,
    sorting,
    handleToggleSortDirection,
    setSorting, // from useProjectLogsSort
    resetSort,
  } = useProjectLogsSort('desc');

  const {
    cursor,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetPagination,
  } = useProjectLogsPagination(PAGE_SIZE);

  const {
    isDetailSheetOpen,
    currentLogDetail,
    openDetailSheet,
    setIsDetailSheetOpen, // from useLogDetailSheet
  } = useLogDetailSheet();

  // This local columnFilters state is for TanStack Table's internal filtering if ever used.
  // Currently, filtering logic is mostly handled by the query options.
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);


  // --- DATA FETCHING ---
  const projectLogsOptions = useMemo<ProjectLogsOptions>(() => ({
    limit: PAGE_SIZE,
    sortDirection,
    ...(filters.levels.length > 0 ? { level: filters.levels } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
    ...(filters.metadata.length > 0 ? { metadata: filters.metadata } : {}),
    ...(searchQuery ? { messageContains: searchQuery } : {}), // Apply search query for server-side filtering
    ...(cursor ? { cursor } : {}),
  }), [PAGE_SIZE, sortDirection, filters, searchQuery, cursor]);

  const { data, isLoading, isError, refetch } = useLogsByProjectId(projectId, projectLogsOptions);
  const logs = useMemo(() => data?.logs || [], [data]);
  const hasNextPage = useMemo(() => data?.hasNextPage || false, [data]);

 useEffect(() => {
    // If we want local table filtering based on searchQuery for the 'message' column
    // This would filter client-side on top of server-side results.
    // For now, searchQuery is used in projectLogsOptions for server-side filtering.
    // table.getColumn('message')?.setFilterValue(searchQuery);
  }, [searchQuery /*, table*/]); // Add table if re-enabling client-side search filter


  const {
    selectedLogs,
    selectedCount,
    handleSelectAll,
    handleSelectRow,
    resetSelection,
  } = useProjectLogsSelection(logs); // Pass current page logs to hook

  // --- CALLBACKS & EVENT HANDLERS ---
  const handleApplyFiltersAndReset = useCallback((newFilters: Parameters<typeof applyFiltersFromModal>[0]) => {
    applyFiltersFromModal(newFilters);
    resetPagination();
    resetSelection();
    // Data will refetch due to projectLogsOptions dependency change
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
    handleNextPage(logs); // Pass current logs for cursor logic
  }, [handleNextPage, logs]);

  const onPrevPageHandler = useCallback(() => {
    handlePrevPage();
  }, [handlePrevPage]);


  // --- BATCH ACTIONS ---
  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    toast.info(`Mock Deleting ${selectedIds.length} logs...`, {
      description: "This is a placeholder. Actual deletion would be implemented here."
    });
    // API call to delete logs by selectedIds
    // After successful deletion: refetch(), resetSelection()
    resetSelection(); // For now, just reset selection
  };

  const handleExportSelected = () => {
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    toast.info(`Mock Exporting ${selectedIds.length} logs...`, {
      description: "This is a placeholder. Actual export would be implemented here."
    });
    // Logic to export selectedLogItems
  };

  const handleCopySelected = () => {
    const selectedIds = Object.keys(selectedLogs).filter(id => selectedLogs[id]);
    const selectedLogItems = logs.filter(log => selectedIds.includes(log.id));
    const textToCopy = selectedLogItems.map(log => {
      return `[${new Date(log.timestamp).toLocaleString()}] [${log.level.toUpperCase()}] ${log.message}`;
    }).join('\n');

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.success(`Copied ${selectedIds.length} logs to clipboard`);
      })
      .catch(() => {
        toast.error("Failed to copy logs to clipboard");
      });
  };

  // --- TABLE SETUP ---
  const columns = useMemo(() => getProjectLogsTableColumns({
    selectedLogs,
    onSelectAll: (checked) => handleSelectAll(checked), // Pass current logs to selectAll
    onSelectRow: handleSelectRow,
    onOpenDetailSheet: openDetailSheet,
    currentLogs: logs,
  }), [selectedLogs, handleSelectAll, handleSelectRow, openDetailSheet, logs]);

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // For client-side filtering if enabled
    onSortingChange: setSorting, // From useProjectLogsSort
    onColumnFiltersChange: setColumnFilters, // Local state for TanStack's internal filters
    state: {
      sorting, // From useProjectLogsSort
      columnFilters, // Local state
      // rowSelection: selectedLogs, // TanStack table can manage selection, but we do it manually for now
    },
    manualPagination: true, // Since we handle pagination logic
    manualSorting: true,    // Since we handle sorting via query options
    manualFiltering: true,  // Since we handle filtering via query options (mostly)
    enableRowSelection: true, // Enable row selection features
    onRowSelectionChange: (updater) => {
        // This is if you want tanstack table to control the selectedLogs state.
        // We are doing it manually via useProjectLogsSelection for now.
        // If 'updater' is a function: setSelectedLogs(updater(selectedLogs));
        // Else: setSelectedLogs(updater);
    },
    debugTable: process.env.NODE_ENV === 'development',
  });


  // --- RENDER ---
  return (
    <>
      <LogsFilterModal
        open={filterModalOpen}
        onOpenChange={setFilterModalOpen}
        filters={filters}
        onApply={handleApplyFiltersAndReset}
        onReset={handleResetFiltersAndReset}
        projectId={projectId}
      />
      <Card className="border shadow-sm w-full">
        <ProjectLogsTableHeader
          filters={filters}
          sortDirection={sortDirection}
          onOpenFilterModal={openFilterModal}
          onToggleSortDirection={handleToggleSortAndReset}
          totalLogsCount={(!filtersActive && !isLoading) ? logs.length : undefined} // Simple count for current page when no filters
          isLoading={isLoading}
        />
        <ProjectLogsTableToolbar
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery} // The query will be applied via useMemo -> projectLogsOptions
          onOpenFilterModal={openFilterModal}
          selectedCount={selectedCount}
          onDeleteSelected={handleDeleteSelected}
          onExportSelected={handleExportSelected}
          onCopySelected={handleCopySelected}
          isLoading={isLoading}
        />
        <ProjectLogsTableContent
          table={table}
          columns={columns}
          isLoading={isLoading}
          isError={isError}
          logs={logs}
          selectedLogs={selectedLogs}
          isFiltered={filtersActive || !!searchQuery}
          onRetry={() => {
            resetPagination(); // Reset pagination before refetch
            refetch();
          }}
          onClearFilters={handleResetFiltersAndReset}
        />
        <ProjectLogsTableFooter
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          onPrevPage={onPrevPageHandler}
          onNextPage={onNextPageHandler}
          isLoading={isLoading}
          currentLogCount={logs.length}
        />
      </Card>
      <LogDetailSheet
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        log={currentLogDetail}
      />
    </>
  );
} 