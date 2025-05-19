import { useState, useCallback } from 'react';
import { SortingState } from '@tanstack/react-table';

export type SortDirection = 'asc' | 'desc';

export function useProjectLogsSort(initialDirection: SortDirection = 'desc') {
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialDirection);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'timestamp', desc: initialDirection === 'desc' }
  ]);

  const handleToggleSortDirection = useCallback(() => {
    setSortDirection(prevDirection => {
      const newDirection = prevDirection === 'desc' ? 'asc' : 'desc';
      setSorting([{ id: 'timestamp', desc: newDirection === 'desc' }]);
      // Caller will need to reset pagination
      return newDirection;
    });
  }, []);

  const resetSort = useCallback(() => {
    setSortDirection(initialDirection);
    setSorting([{ id: 'timestamp', desc: initialDirection === 'desc' }]);
  }, [initialDirection]);

  return {
    sortDirection,
    sorting,
    handleToggleSortDirection,
    setSorting, // Expose for direct TanStack table control if needed
    resetSort
  };
} 