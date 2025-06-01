import type { SpanData } from '@one-logger/server-sdk';

// Helper function to format duration
export const formatDuration = (durationMs: number) => {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  } else {
    return `${(durationMs / 60000).toFixed(2)}m`;
  }
};

// Helper function to flatten spans hierarchy for timeline visualization with collapse support
export const flattenSpans = (
  spans: SpanData[], 
  level = 0, 
  collapsedSpans: Set<string> = new Set()
): Array<SpanData & { level: number; hasChildren: boolean }> => {
  const result: Array<SpanData & { level: number; hasChildren: boolean }> = [];
  
  for (const span of spans) {
    const hasChildren = span.spans ? span.spans.length > 0 : false;
    result.push({ ...span, level, hasChildren });
    // Only include children if the parent is not collapsed
    if (hasChildren && !collapsedSpans.has(span.id)) {
      result.push(...flattenSpans(span?.spans ?? [], level + 1, collapsedSpans));
    }
  }
  
  return result;
};