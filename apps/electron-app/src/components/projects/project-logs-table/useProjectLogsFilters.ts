import { useState } from "react";
import { MetadataFilter } from "@/types/log";
import { LogsFilterState, LogLevel } from "./LogsFilterModal";

export interface UseProjectLogsFiltersProps {
  initialFilters?: Partial<LogsFilterState>;
  initialSearchQuery?: string;
}

export function useProjectLogsFilters(props: UseProjectLogsFiltersProps = {}) {
  const { initialFilters = {}, initialSearchQuery = "" } = props;

  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [filterModalOpen, setFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<LogsFilterState>({
    levels: initialFilters.levels || [],
    fromDate: initialFilters.fromDate || "",
    toDate: initialFilters.toDate || "",
    metadata: initialFilters.metadata || [],
  });

  const [filtersActive, setFiltersActive] = useState<boolean>(() => {
    return !!(
      (initialFilters.levels && initialFilters.levels.length > 0) ||
      initialFilters.fromDate ||
      initialFilters.toDate ||
      (initialFilters.metadata && initialFilters.metadata.length > 0)
    );
  });

  const handleApplyFilters = (newFilters: LogsFilterState) => {
    setFilters(newFilters);
    setFiltersActive(
      newFilters.levels.length > 0 ||
      !!newFilters.fromDate ||
      !!newFilters.toDate ||
      newFilters.metadata.length > 0
    );
    setFilterModalOpen(false);
    // Caller will need to reset pagination
  };

  const handleResetFilters = () => {
    setFilters({ levels: [], fromDate: "", toDate: "", metadata: [] });
    setFiltersActive(false);
    setSearchQuery(""); // Also reset search query
    setFilterModalOpen(false);
    // Caller will need to reset pagination
  };

  const openFilterModal = () => setFilterModalOpen(true);
  const closeFilterModal = () => setFilterModalOpen(false);

  return {
    searchQuery,
    setSearchQuery,
    filterModalOpen,
    openFilterModal,
    closeFilterModal,
    setFilterModalOpen, // Expose for direct control if needed
    filters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
  };
} 