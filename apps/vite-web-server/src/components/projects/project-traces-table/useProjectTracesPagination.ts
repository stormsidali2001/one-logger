import { useState, useCallback } from 'react';

interface CursorType {
  id: string;
  timestamp: string;
}

export function useProjectTracesPagination(pageSize: number) {
  const [cursor, setCursor] = useState<CursorType | undefined>(undefined);
  const [cursors, setCursors] = useState<Array<CursorType | undefined>>([undefined]);
  const [currentPage, setCurrentPage] = useState(0);

  const handleNextPage = useCallback((nextCursor: CursorType) => {
    const newCursors = [...cursors.slice(0, currentPage + 1), nextCursor];
    setCursors(newCursors);
    setCursor(nextCursor);
    setCurrentPage(currentPage + 1);
  }, [cursors, currentPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      const prevCursor = cursors[currentPage - 1];
      setCursor(prevCursor);
      setCurrentPage(currentPage - 1);
    }
  }, [cursors, currentPage]);

  const resetPagination = useCallback(() => {
    setCursor(undefined);
    setCursors([undefined]);
    setCurrentPage(0);
  }, []);

  return {
    cursor,
    currentPage,
    handleNextPage,
    handlePrevPage,
    resetPagination,
  };
}