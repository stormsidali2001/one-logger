import React from 'react';
import { Activity } from 'lucide-react';

export function TraceHeader() {
  return (
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
  );
}