import React, { useState, useMemo } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TraceData, SpanData } from '@one-logger/types';
import { formatDuration, flattenSpans } from './utils/traceUtils';
import { EmptyTraceState } from './components/EmptyTraceState';
import { TraceHeader } from './components/TraceHeader';
import { TraceBasicInfo } from './components/TraceBasicInfo';
import { SpanTimeline } from './components/SpanTimeline';

interface TraceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trace: TraceData | null;
}



export function TraceDetailSheet({ open, onOpenChange, trace }: TraceDetailSheetProps) {
  const [collapsedSpans, setCollapsedSpans] = useState<Set<string>>(new Set());

  const toggleSpanCollapse = (spanId: string) => {
    setCollapsedSpans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(spanId)) {
        newSet.delete(spanId);
      } else {
        newSet.add(spanId);
      }
      return newSet;
    });
  };

  const flatSpans = useMemo(() => {
    if (!trace?.spans) return [];
    return flattenSpans(trace.spans, 0, collapsedSpans);
  }, [trace?.spans, collapsedSpans]);

  const startTime = trace?.startTime ? new Date(trace.startTime) : null;
  const endTime = trace?.endTime ? new Date(trace.endTime) : null;
  const duration = startTime && endTime ? endTime.getTime() - startTime.getTime() : null;
  const status = trace?.status || 'unknown';

  if (!trace) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full max-w-4xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <EmptyTraceState />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-4xl bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <TraceHeader />
        
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-8 pr-6">
            <TraceBasicInfo 
              trace={trace}
              startTime={startTime}
              duration={duration}
              status={status}
            />
            
            <SpanTimeline 
              flatSpans={flatSpans}
              startTime={startTime}
              endTime={endTime}
              collapsedSpans={collapsedSpans}
              toggleSpanCollapse={toggleSpanCollapse}
            />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}