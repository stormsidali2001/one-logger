import type { ColumnDef } from '@tanstack/react-table';
import type { Log } from '@/types/log';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';

export const getLevelBadgeColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'error': return "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm";
    case 'warn': return "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm";
    case 'info': return "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm";
    case 'debug': return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm";
    case 'trace': return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-sm";
    default: return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white shadow-sm";
  }
};

interface GetProjectLogsTableColumnsProps {
  selectedLogs: Record<string, boolean>;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (id: string, checked: boolean) => void;
  onOpenDetailSheet: (log: Log) => void;
  currentLogs: Log[]; // Needed for select all on current page logic
}

export const getProjectLogsTableColumns = (
  {
    selectedLogs,
    onSelectAll,
    onSelectRow,
    onOpenDetailSheet,
    currentLogs,
  }: GetProjectLogsTableColumnsProps
): ColumnDef<Log>[] => [
  {
    id: 'select',
    header: () => (
      <Checkbox
        checked={
          currentLogs && currentLogs.length > 0 &&
          currentLogs.every(log => selectedLogs[log.id])
        }
        onCheckedChange={(value) => onSelectAll(!!value)}
        aria-label="Select all rows on current page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={!!selectedLogs[row.original.id]}
        onCheckedChange={(value) => onSelectRow(row.original.id, !!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  },
  {
    accessorKey: 'timestamp',
    header: 'Timestamp',
    cell: info => {
      const date = new Date(info.getValue() as string);
      return (
        <div className="text-sm">
          <div className="font-semibold text-gray-900">{date.toLocaleDateString()}</div>
          <div className="text-gray-600 text-xs">{date.toLocaleTimeString()}</div>
        </div>
      );
    }
  },
  {
    accessorKey: 'level',
    header: 'Level',
    cell: info => {
      const level = info.getValue() as string;
      const badgeClass = getLevelBadgeColor(level);
      return (
        <Badge className={`${badgeClass} font-semibold px-3 py-1 rounded-full border-0 transition-all duration-200`}>
          {level.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: info => (
      <div className="font-mono text-sm whitespace-pre-wrap max-w-xl py-2 text-gray-800 leading-relaxed">
        {info.getValue() as string}
      </div>
    )
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
    cell: info => {
      const metadata = info.getValue() as Log['metadata'];
      if (!metadata || metadata.length === 0) return <div className="text-xs text-gray-500 italic">No metadata</div>;

      const visibleMetadata = metadata.slice(0, 2);
      const hasMore = metadata.length > 2;

      return (
        <div className="max-w-xs">
          <div className="font-mono text-xs bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-3 whitespace-pre-wrap overflow-auto max-h-24 shadow-sm">
            {visibleMetadata.map(meta => (
              <div key={meta.key} className="mb-1 truncate">
                <span className="text-blue-600 font-semibold">{meta.key}:</span>{" "}
                <span className="text-gray-800" title={String(meta.value)}>{String(meta.value)}</span>
              </div>
            ))}
            {hasMore && (
              <div className="text-blue-500 text-xs mt-2 font-medium">
                +{metadata.length - 2} more...
              </div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const log = row.original;
      return (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onOpenDetailSheet(log)}
          className="rounded-full hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
          aria-label="View log details"
        >
          <ChevronRightIcon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
        </Button>
      );
    },
    size: 50,
  }
];