import { useState, useCallback, useMemo } from 'react';
import type { TraceData } from '@one-logger/server-sdk';

export function useProjectTracesSelection(traces: TraceData[]) {
  const [selectedTraces, setSelectedTraces] = useState<Record<string, boolean>>({});

  const selectedCount = useMemo(() => {
    return Object.values(selectedTraces).filter(Boolean).length;
  }, [selectedTraces]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      const newSelection: Record<string, boolean> = {};
      traces.forEach(trace => {
        newSelection[trace.id] = true;
      });
      setSelectedTraces(newSelection);
    } else {
      setSelectedTraces({});
    }
  }, [traces]);

  const handleSelectRow = useCallback((traceId: string, checked: boolean) => {
    setSelectedTraces(prev => ({
      ...prev,
      [traceId]: checked,
    }));
  }, []);

  const resetSelection = useCallback(() => {
    setSelectedTraces({});
  }, []);

  return {
    selectedTraces,
    selectedCount,
    handleSelectAll,
    handleSelectRow,
    resetSelection,
  };
}