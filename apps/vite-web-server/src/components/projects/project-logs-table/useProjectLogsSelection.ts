import type { Log } from '@/types/log';
import { useState, useEffect, useCallback } from 'react';

export function useProjectLogsSelection(logs: Log[] = []) {
  const [selectedLogs, setSelectedLogs] = useState<Record<string, boolean>>({});
  const [selectedCount, setSelectedCount] = useState<number>(0);

  useEffect(() => {
    const count = Object.values(selectedLogs).filter(Boolean).length;
    setSelectedCount(count);
  }, [selectedLogs]);

  const resetSelection = useCallback(() => {
    setSelectedLogs({});
  }, []);

  // Reset selection when underlying logs data changes (e.g., page change)
  useEffect(() => {
    resetSelection();
  }, [logs, resetSelection]);

  const handleSelectAll = useCallback((checked: boolean) => {
    const newSelected: Record<string, boolean> = {};
    if (checked) {
      logs.forEach(log => {
        newSelected[log.id] = true;
      });
    }
    // If unchecking, it effectively clears selection for current page logs
    setSelectedLogs(newSelected);
  }, [logs]);

  const handleSelectRow = useCallback((id: string, checked: boolean) => {
    setSelectedLogs(prev => {
      const newSelected = { ...prev };
      if (checked) {
        newSelected[id] = true;
      } else {
        delete newSelected[id];
      }
      return newSelected;
    });
  }, []);

  return {
    selectedLogs,
    selectedCount,
    handleSelectAll,
    handleSelectRow,
    resetSelection,
  };
} 