import { useState, useCallback, useMemo, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

interface TracesFilters {
  status: string[];
  fromDate?: string;
  toDate?: string;
  minDuration?: number;
  maxDuration?: number;
}

interface UseProjectTracesFiltersProps {
  debounceTimeout?: number;
}

export function useProjectTracesFilters({ debounceTimeout = 500 }: UseProjectTracesFiltersProps = {}) {
  const [inputValue, setInputValue] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<TracesFilters>({
    status: [],
  });

  // Debounced search query
  const searchQuery = useDebounce(inputValue, debounceTimeout);

  const filtersActive = useMemo(() => {
    return (
      filters.status.length > 0 ||
      !!filters.fromDate ||
      !!filters.toDate ||
      filters.minDuration !== undefined ||
      filters.maxDuration !== undefined
    );
  }, [filters]);

  const openFilterModal = useCallback(() => {
    setFilterModalOpen(true);
  }, []);

  const handleApplyFilters = useCallback((newFilters: TracesFilters) => {
    setFilters(newFilters);
    setFilterModalOpen(false);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      status: [],
    });
    setInputValue('');
    setFilterModalOpen(false);
  }, []);

  return {
    searchQuery,
    inputValue,
    setSearchQuery: setInputValue,
    filterModalOpen,
    openFilterModal,
    setFilterModalOpen,
    filters,
    handleApplyFilters,
    handleResetFilters,
    filtersActive,
  };
}