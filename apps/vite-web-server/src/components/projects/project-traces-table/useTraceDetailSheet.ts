import { useState, useCallback } from 'react';
import type { TraceData } from '@notjustcoders/one-logger-server-sdk';

export function useTraceDetailSheet() {
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [currentTraceDetail, setCurrentTraceDetail] = useState<TraceData | null>(null);

  const openDetailSheet = useCallback((trace: TraceData) => {
    setCurrentTraceDetail(trace);
    setIsDetailSheetOpen(true);
  }, []);

  const closeDetailSheet = useCallback(() => {
    setIsDetailSheetOpen(false);
    setCurrentTraceDetail(null);
  }, []);

  return {
    isDetailSheetOpen,
    currentTraceDetail,
    openDetailSheet,
    closeDetailSheet,
    setIsDetailSheetOpen,
  };
}