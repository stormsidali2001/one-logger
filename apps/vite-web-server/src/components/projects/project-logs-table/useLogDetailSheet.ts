import { useState, useCallback } from 'react';
import { Log } from '@/types/log';

export function useLogDetailSheet() {
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState<boolean>(false);
  const [currentLogDetail, setCurrentLogDetail] = useState<Log | null>(null);

  const openDetailSheet = useCallback((log: Log) => {
    setCurrentLogDetail(log);
    setIsDetailSheetOpen(true);
  }, []);

  const closeDetailSheet = useCallback(() => {
    setIsDetailSheetOpen(false);
    // Optionally reset currentLogDetail, though it's not strictly necessary
    // if it's only read when isDetailSheetOpen is true.
    // setCurrentLogDetail(null);
  }, []);

  return {
    isDetailSheetOpen,
    currentLogDetail,
    openDetailSheet,
    closeDetailSheet,
    setIsDetailSheetOpen, // Expose for direct control if needed
  };
} 