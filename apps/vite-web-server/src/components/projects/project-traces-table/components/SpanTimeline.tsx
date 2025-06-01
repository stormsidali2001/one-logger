import React from 'react';
import { format } from 'date-fns';
import { ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { formatDuration } from '../utils/traceUtils';
import { SpanData } from '@one-logger/types';

interface SpanTimelineProps {
  flatSpans: SpanData[];
  startTime: Date;
  endTime: Date | null;
  collapsedSpans: Set<string>;
  toggleSpanCollapse: (spanId: string) => void;
}

export function SpanTimeline({ 
  flatSpans, 
  startTime, 
  endTime, 
  collapsedSpans, 
  toggleSpanCollapse 
}: SpanTimelineProps) {
  return (
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
  );
}