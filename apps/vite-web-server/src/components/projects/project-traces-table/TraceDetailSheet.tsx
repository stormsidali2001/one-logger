import React from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, Zap, CheckCircle2, Eye, Hash, Calendar, Timer, Database, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import type { SpanData, TraceData } from '@one-logger/server-sdk';

interface TraceDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trace: TraceData | null;
}

// Helper function to format duration
const formatDuration = (durationMs: number) => {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  } else if (durationMs < 60000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  } else {
    return `${(durationMs / 60000).toFixed(2)}m`;
  }
};

// Helper function to flatten spans hierarchy for timeline visualization with collapse support
const flattenSpans = (spans: SpanData[], level = 0, collapsedSpans: Set<string> = new Set()): Array<SpanData & { level: number; hasChildren: boolean }> => {
  const result: Array<SpanData & { level: number; hasChildren: boolean }> = [];
  
  for (const span of spans) {
    const hasChildren = span.spans ? span.spans.length > 0:false;
    result.push({ ...span, level, hasChildren });
    // Only include children if the parent is not collapsed
    if (hasChildren && !collapsedSpans.has(span.id)) {
      result.push(...flattenSpans(span?.spans ??[], level + 1, collapsedSpans));
    }
  }
  
  return result;
};

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



  if (!trace) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[100vw] !max-w-[100vw] h-[100vh] overflow-hidden !w-[100vw] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl text-white shadow-xl">
                <Activity className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  No Trace Selected
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Select a trace from the table to view detailed information about its execution and spans.
                </p>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  const startTime = new Date(trace.startTime);
  const endTime = trace.endTime ? new Date(trace.endTime) : null;
  const duration = endTime ? endTime.getTime() - startTime.getTime() : null;
  const spans = trace.spans || [];
  const flatSpans = flattenSpans(spans, 0, collapsedSpans);
  const status = trace.status || 'running';

  return (
    <Sheet open={open} onOpenChange={onOpenChange} >
      <SheetContent className="w-[100vw] !max-w-[100vw] h-[100vh] overflow-hidden !w-[100vw] bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 -m-6 mb-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Trace Details
              </h1>
              <p className="text-blue-100 text-lg mt-1">
                Comprehensive trace execution analysis
              </p>
            </div>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-200px)] px-2">
          <div className="space-y-8">
            {/* Basic Information Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                    <Database className="h-6 w-6" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Basic Information
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Hash className="h-4 w-4 text-blue-600" />
                      TRACE NAME
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
                      <p className="font-mono text-sm text-gray-900 break-all">{trace.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Hash className="h-4 w-4 text-purple-600" />
                      TRACE ID
                    </div>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50 shadow-sm">
                      <p className="font-mono text-sm text-gray-900 break-all">{trace.id}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-green-600" />
                      START TIME
                    </div>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50 shadow-sm">
                      <p className="font-mono text-sm text-gray-900">{format(startTime, "MMM dd, yyyy HH:mm:ss")}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      END TIME
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200/50 shadow-sm">
                      <p className="font-mono text-sm text-gray-900">
                        {endTime ? format(endTime, "MMM dd, yyyy HH:mm:ss") : "In Progress"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Timer className="h-4 w-4 text-cyan-600" />
                      DURATION
                    </div>
                    <div className="p-4 bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl border border-cyan-200/50 shadow-sm">
                      <p className="font-mono text-sm text-gray-900">
                        {duration !== null ? formatDuration(duration) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Activity className="h-4 w-4 text-indigo-600" />
                      STATUS
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-200/50 shadow-sm">
                      {status === 'completed' && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg text-sm px-4 py-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </Badge>
                      )}
                      {status === 'failed' && (
                        <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white border-0 shadow-lg text-sm px-4 py-2">
                          <XCircle className="h-4 w-4 mr-2" />
                          Failed
                        </Badge>
                      )}
                      {status === 'running' && (
                        <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white border-0 shadow-lg text-sm px-4 py-2">
                          <Clock className="h-4 w-4 mr-2" />
                          Running
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Spans Card */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white">
                    <Zap className="h-6 w-6" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Spans
                  </span>
                  <Badge className="ml-auto bg-gradient-to-r from-green-500 to-blue-600 text-white border-0 shadow-lg text-base px-4 py-2">
                    {flatSpans.length} {flatSpans.length === 1 ? 'span' : 'spans'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
              
                {flatSpans.length > 0 ? (
                   <div className="space-y-6">
                     {/* Gantt Chart Timeline */}
                     <div className="bg-gradient-to-r from-white to-gray-50/50 rounded-2xl border border-gray-200/50 shadow-lg p-6">
                       <div className="space-y-4">
                         {/* Timeline Header */}
                         <div className="flex items-center justify-between mb-6">
                           <h4 className="text-lg font-semibold text-gray-900">Timeline Visualization</h4>
                           <div className="text-sm text-gray-600 font-mono">
                             {startTime && endTime ? (
                               <span>
                                 {format(startTime, "HH:mm:ss")} → {format(endTime, "HH:mm:ss")}
                               </span>
                             ) : (
                               <span>Timeline</span>
                             )}
                           </div>
                         </div>
                         
                         {/* Gantt Chart */}
                         <div className="space-y-3">
                           {flatSpans.map((span, index) => {
                             const spanStart = span.startTime ? new Date(span.startTime).getTime() : 0;
                             const spanEnd = span.endTime ? new Date(span.endTime).getTime() : Date.now();
                             const traceStart = startTime.getTime();
                             const traceEnd = endTime ? endTime.getTime() : Date.now();
                             const totalDuration = traceEnd - traceStart;
                             
                             // Calculate position and width as percentages
                             const startOffset = totalDuration > 0 ? ((spanStart - traceStart) / totalDuration) * 100 : 0;
                             const spanWidth = totalDuration > 0 ? ((spanEnd - spanStart) / totalDuration) * 100 : 100;
                             
                             const colors = [
                               'from-blue-500 to-blue-600',
                               'from-purple-500 to-purple-600',
                               'from-green-500 to-green-600',
                               'from-orange-500 to-orange-600',
                               'from-pink-500 to-pink-600',
                               'from-cyan-500 to-cyan-600',
                               'from-indigo-500 to-indigo-600',
                               'from-red-500 to-red-600'
                             ];
                             const colorClass = colors[index % colors.length];
                             
                             return (
                               <div key={span.id || index} className="relative">
                                 {/* Span Label */}
                                 <div className="flex items-center justify-between mb-2">
                                   <div className="flex items-center gap-3" style={{ marginLeft: `${span.level * 20}px` }}>
                                     {/* Collapse/Expand button for spans with children */}
                                     {span.hasChildren ? (
                                       <button
                                         onClick={() => toggleSpanCollapse(span.id)}
                                         className="flex items-center justify-center w-5 h-5 rounded hover:bg-gray-200 transition-colors"
                                         title={collapsedSpans.has(span.id) ? 'Expand children' : 'Collapse children'}
                                       >
                                         {collapsedSpans.has(span.id) ? (
                                           <ChevronRight className="w-3 h-3 text-gray-600" />
                                         ) : (
                                           <ChevronDown className="w-3 h-3 text-gray-600" />
                                         )}
                                       </button>
                                     ) : (
                                       <div className="w-5 h-5 flex items-center justify-center">
                                         {span.level > 0 && (
                                           <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                         )}
                                       </div>
                                     )}
                                     
                                     {/* Hierarchy indicator */}
                                     {span.level > 0 && (
                                       <div className="flex items-center">
                                         {[...Array(span.level)].map((_, i) => (
                                           <div key={i} className="w-4 h-px bg-gray-300 mr-1"></div>
                                         ))}
                                         <div className="w-2 h-2 border-l border-b border-gray-300 mr-2"></div>
                                       </div>
                                     )}
                                     <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colorClass}`}></div>
                                     <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                       {span.name || `Span ${index + 1}`}
                                     </span>
                                     {span.level > 0 && (
                                       <Badge variant="outline" className="text-xs px-2 py-1 bg-gray-50">
                                         L{span.level}
                                       </Badge>
                                     )}
                                     {span.hasChildren && (
                                       <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700">
                                         {span.spans?.length} child{span?.spans?.length !== 1 ? 'ren' : ''}
                                       </Badge>
                                     )}
                                   </div>
                                   <div className="flex items-center gap-2 text-xs text-gray-600">
                                     {span.startTime && span.endTime && (
                                       <Badge variant="outline" className="text-xs px-2 py-1">
                                         {formatDuration(spanEnd - spanStart)}
                                       </Badge>
                                     )}
                                   </div>
                                 </div>
                                 
                                 {/* Timeline Bar */}
                                 <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden" style={{ marginLeft: `${span.level * 20}px` }}>
                                   {/* Background grid lines */}
                                   <div className="absolute inset-0 flex">
                                     {[...Array(10)].map((_, i) => (
                                       <div key={i} className="flex-1 border-r border-gray-200 last:border-r-0"></div>
                                     ))}
                                   </div>
                                   
                                   {/* Span Bar */}
                                   <div 
                                     className={`absolute top-1 bottom-1 bg-gradient-to-r ${colorClass} rounded shadow-sm transition-all duration-300 hover:shadow-md`}
                                     style={{
                                       left: `${Math.max(0, Math.min(startOffset, 100))}%`,
                                       width: `${Math.max(1, Math.min(spanWidth, 100 - Math.max(0, startOffset)))}%`
                                     }}
                                   >
                                     {/* Span content */}
                                     <div className="h-full flex items-center justify-center text-white text-xs font-medium px-2">
                                       {spanWidth > 15 && (
                                         <span className="truncate">
                                           {span.startTime && format(new Date(span.startTime), "HH:mm:ss")}
                                         </span>
                                       )}
                                     </div>
                                   </div>
                                 </div>
                                 
                                 {/* Span Details */}
                                 <div className="mt-2 text-xs text-gray-500 font-mono pl-6" style={{ marginLeft: `${span.level * 20}px` }}>
                                   {span.startTime && (
                                     <span>
                                       Start: {format(new Date(span.startTime), "HH:mm:ss.SSS")}
                                       {span.endTime && (
                                         <span className="ml-4">
                                           End: {format(new Date(span.endTime), "HH:mm:ss.SSS")}
                                         </span>
                                       )}
                                     </span>
                                   )}
                                 </div>
                               </div>
                             );
                           })}
                         </div>
                         
                         {/* Timeline Scale */}
                         <div className="mt-6 pt-4 border-t border-gray-200">
                           <div className="flex justify-between text-xs text-gray-500 font-mono">
                             <span>0%</span>
                             <span>25%</span>
                             <span>50%</span>
                             <span>75%</span>
                             <span>100%</span>
                           </div>
                           <div className="mt-1 text-xs text-gray-400 text-center">
                             Timeline Progress
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl mb-6">
                      <Eye className="h-12 w-12 text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
                      No spans found for this trace
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto text-lg">
                      Spans will appear here when available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}