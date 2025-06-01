import React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Activity } from 'lucide-react';

interface EmptyTraceStateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmptyTraceState({ open, onOpenChange }: EmptyTraceStateProps) {
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