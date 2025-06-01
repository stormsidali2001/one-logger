import { useState, useCallback } from 'react';
import { type SortingState } from '@tanstack/react-table';

export function useProjectTracesSort(initialDirection: 'asc' | 'desc' = 'desc') {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialDirection);
  const [sorting, setSorting] = useState<SortingState>([{ id: "startTime", desc: initialDirection === 'desc' }]);

  const handleToggleSortDirection = useCallback(() => {
    const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    setSortDirection(newDirection);
    setSorting([{ id: "startTime", desc: newDirection === 'desc' }]);
  }, [sortDirection]);

  const resetSort = useCallback(() => {
    setSortDirection(initialDirection);
    setSorting([{ id: "startTime", desc: initialDirection === 'desc' }]);
  }, [initialDirection]);

  return {
    sortDirection,
    sorting,
    handleToggleSortDirection,
    setSorting,
    resetSort,
  };
}