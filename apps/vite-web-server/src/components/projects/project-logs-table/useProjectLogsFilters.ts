import { useState, useEffect } from "react";
import type{ LogsFilterState } from "./LogsFilterModal";

export interface UseProjectLogsFiltersProps {
  initialFilters?: Partial<LogsFilterState>;
  initialSearchQuery?: string;
  debounceTimeout?: number;
}

export function useProjectLogsFilters(props: UseProjectLogsFiltersProps = {}) {
  const {
    initialFilters = {},
    initialSearchQuery = "",
    debounceTimeout = 500 // Default debounce timeout 500ms
  } = props;

  // inputValue is the immediate value from the text input
  const [inputValue, setInputValue] = useState<string>(initialSearchQuery);
  // searchQuery is the debounced value used for actual filtering/API calls
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

  // Debounce effect for searchQuery
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, debounceTimeout);

    // Cleanup function to clear timeout if inputValue changes before timeout
    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounceTimeout]); // Re-run effect if inputValue or debounceTimeout changes

  const handleApplyFilters = (newFilters: LogsFilterState) => {
    setFilters(newFilters);
    setFiltersActive(
      newFilters.levels.length > 0 ||
      !!newFilters.fromDate ||
      !!newFilters.toDate ||
      newFilters.metadata.length > 0
    );
    setFilterModalOpen(false);
    // Caller will need to reset pagination. Search query is handled by its own debounce.
  };

  const handleResetFilters = () => {
    setFilters({ levels: [], fromDate: "", toDate: "", metadata: [] });
    setFiltersActive(false);
    setInputValue(""); // Reset input value immediately
    // setSearchQuery(""); // Debounced searchQuery will update via useEffect
    setFilterModalOpen(false);
    // Caller will need to reset pagination
  };

  const openFilterModal = () => setFilterModalOpen(true);
  const closeFilterModal = () => setFilterModalOpen(false);

  return {
    searchQuery, // This is the debounced search query
    setSearchQuery: setInputValue, // The function to call when input changes (updates inputValue)
    inputValue, // Expose inputValue if needed for direct display in input field
    filterModalOpen,
    openFilterModal,
    closeFilterModal,
    setFilterModalOpen,
    filters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
  };
} 