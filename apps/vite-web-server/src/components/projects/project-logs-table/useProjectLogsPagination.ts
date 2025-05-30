import { useState, useCallback } from 'react';
import type{ LogCursor, Log } from '@/types/log';
import { getNextCursor } from '@/hooks/queries/useLogsByProjectId'; // Assuming this utility is correctly placed

export function useProjectLogsPagination(pageSize: number) {
  const [cursor, setCursor] = useState<LogCursor | undefined>(undefined);
  const [paginationHistory, setPaginationHistory] = useState<LogCursor[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const handleNextPage = useCallback((currentLogs: Log[]) => {
    if (currentLogs.length === pageSize) {
      const nextCursorResult = getNextCursor(currentLogs);
      if (nextCursorResult) {
        setPaginationHistory(prevHistory => {
          const newHistory = [...prevHistory.slice(0, currentPage + 1)];
          if (cursor) {
            newHistory.push(cursor);
          } else if (currentPage === 0 && prevHistory.length === 0) {
            // For the very first page, if no cursor, push a placeholder or handle as needed
            // This case might need refinement based on how initial load (no cursor) is handled
            newHistory.push({ id: 'initial', timestamp: new Date().toISOString() } as LogCursor); 
          }
          return newHistory;
        });
        setCursor(nextCursorResult);
        setCurrentPage(prev => prev + 1);
      }
    }
  }, [pageSize, currentPage, cursor]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      const prevCursor = currentPage > 1 ? paginationHistory[currentPage - 1] : undefined;
      setCursor(prevCursor);
      setCurrentPage(prev => prev - 1);
      // The history for the current page is effectively removed by going to prev page and then next
      setPaginationHistory(prev => prev.slice(0, currentPage)); 
    }
  }, [currentPage, paginationHistory]);

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setPaginationHistory([]);
    setCurrentPage(0);
  }, []);

  return {
    cursor,
    currentPage,
    paginationHistory, // For potential display or debugging, not strictly for control logic
    handleNextPage,
    handlePrevPage,
    resetPagination,
    setCurrentPage, // Exposing for direct manipulation if needed (e.g. after filter changes)
    setCursor // Exposing for direct manipulation
  };
} 