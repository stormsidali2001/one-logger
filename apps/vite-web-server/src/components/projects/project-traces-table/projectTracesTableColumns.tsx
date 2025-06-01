import { type ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Activity,
  Clock,
  Zap,
  CheckCircle2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import type { TraceData } from "@one-logger/server-sdk";

interface GetProjectTracesTableColumnsProps {
  selectedTraces: Record<string, boolean>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (traceId: string, checked: boolean) => void;
  onViewTrace: (trace: TraceData) => void;
  onDeleteTrace: (traceId: string) => void;
  currentTraces: TraceData[];
}

// Helper function to get duration color based on performance
const getDurationColor = (durationMs: number) => {
  if (durationMs < 100) return "bg-green-500";
  if (durationMs < 500) return "bg-yellow-500";
  if (durationMs < 1000) return "bg-orange-500";
  return "bg-red-500";
};

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

export function getProjectTracesTableColumns({
  selectedTraces,
  onSelectAll,
  onSelectRow,
  onViewTrace,
  onDeleteTrace,
  currentTraces,
}: GetProjectTracesTableColumnsProps): ColumnDef<TraceData>[] {
  return [
    {
      id: "select",
      header: ({ table }) => {
        const isAllSelected = currentTraces.length > 0 && currentTraces.every(trace => selectedTraces[trace.id]);
        const isIndeterminate = currentTraces.some(trace => selectedTraces[trace.id]) && !isAllSelected;
        
        return (
          <Checkbox
            checked={isAllSelected}
            ref={(el) => {
              if (el) el.indeterminate = isIndeterminate;
            }}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        );
      },
      cell: ({ row }) => (
        <Checkbox
          checked={!!selectedTraces[row.original.id]}
          onCheckedChange={(checked) => onSelectRow(row.original.id, !!checked)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "startTime",
      header: "Start Time",
      enableSorting: true,
      cell: ({ row }) => {
        const startTime = new Date(row.getValue("startTime") as string);
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">
              {format(startTime, "MMM dd, HH:mm:ss")}
            </div>
            <div className="text-xs text-gray-500">
              {format(startTime, "yyyy")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Trace Name",
      cell: ({ row }) => {
        const startTime = new Date(row.getValue("startTime") as string);
        return (
          <div className="space-y-1">
            <div className="font-medium text-gray-900">{row.getValue("name")}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(startTime, "HH:mm:ss")}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row, table }) => {
        const status = row.getValue("status") as string;
        const startTime = new Date(row.getValue("startTime") as string);
        const endTime = row.original.endTime as string | null;
        console.log({startTime,endTime})
        
        // Calculate all durations for relative bar sizing
        const allTraces = table.getRowModel().rows.map(r => r.original);
        const allDurations = allTraces.map(trace => {
          const start = new Date(trace.startTime).getTime();
          if (trace.endTime) {
            const end = new Date(trace.endTime).getTime();
            return Math.max(0, end - start);
          } else if (trace.status === 'running') {
            // For running traces, use elapsed time since start
            const now = new Date().getTime();
            return Math.max(0, now - start);
          }
          return 0;
        });
        
        const maxDuration = allDurations.length > 0 ? Math.max(...allDurations) : 1;
        
        if (!endTime && status === 'running') {
          // Show elapsed time since start for running traces
          const now = new Date();
          const elapsedMs = Math.max(0, now.getTime() - startTime.getTime());
          const displayDuration = formatDuration(elapsedMs);
          const barWidth = maxDuration > 0 ? Math.min((elapsedMs / maxDuration) * 100, 100) : 0;
          
          return (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-mono font-medium text-gray-900">{displayDuration}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full animate-pulse" 
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        }
        
        if (!endTime) {
          return (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-mono font-medium text-gray-500">-</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-300 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          );
        }
        
        // Calculate duration by subtracting start time from end time
        const durationMs = Math.max(0, new Date(endTime).getTime() - startTime.getTime());
        const displayDuration = formatDuration(durationMs);
        const colorClass = getDurationColor(durationMs);
        const barWidth = maxDuration > 0 ? Math.min((durationMs / maxDuration) * 100, 100) : 0;
        
        return (
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-sm font-mono font-medium text-gray-900">{displayDuration}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${barWidth}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "spans",
      header: "Spans",
      cell: ({ row }) => {
        const spans = row.getValue("spans") as any[] | undefined;
        const spanCount = spans?.length || 0;
        
        return (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              {spanCount}
            </Badge>
            <span className="text-xs text-gray-500">
              {spanCount === 1 ? "span" : "spans"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const startTime = new Date(row.getValue("startTime") as string);
        const now = new Date();
        const isRecent = (now.getTime() - startTime.getTime()) < 300000; // 5 minutes
        
        switch (status) {
          case 'running':
            return (
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Activity className="h-3 w-3 mr-1 animate-pulse" />
                Running
              </Badge>
            );
          case 'failed':
            return (
              <Badge variant="outline" className="text-red-600 border-red-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            );
          case 'completed':
          default:
            return (
              <Badge variant="outline" className={`${isRecent ? "text-green-600 border-green-200" : "text-gray-600 border-gray-200"}`}>
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            );
        }
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const trace = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewTrace(trace)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDeleteTrace(trace.id)}
                className="text-red-600 cursor-pointer hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}