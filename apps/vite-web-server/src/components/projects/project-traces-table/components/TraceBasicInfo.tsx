import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Calendar, Timer, Database, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import type { TraceData } from '@one-logger/server-sdk';
import { formatDuration } from '../utils/traceUtils';

interface TraceBasicInfoProps {
  trace: TraceData;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  status: string;
}

export function TraceBasicInfo({ trace, startTime, endTime, duration, status }: TraceBasicInfoProps) {
  return (
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
  );
}