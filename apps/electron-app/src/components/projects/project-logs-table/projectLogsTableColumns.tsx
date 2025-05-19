import { ColumnDef } from '@tanstack/react-table';
import { Log } from '@/types/log';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';

export const getLevelBadgeColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'error': return "bg-red-500 hover:bg-red-600";
    case 'warn': return "bg-amber-500 hover:bg-amber-600";
    case 'info': return "bg-blue-500 hover:bg-blue-600";
    case 'debug': return "bg-green-500 hover:bg-green-600";
    case 'trace': return "bg-slate-400 hover:bg-slate-500";
    default: return "bg-slate-400 hover:bg-slate-500";
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
    header: ({ table }) => (
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
          <div className="font-medium">{date.toLocaleDateString()}</div>
          <div className="text-muted-foreground">{date.toLocaleTimeString()}</div>
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
        <Badge className={`${badgeClass} font-medium px-2 py-1`}>
          {level.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    accessorKey: 'message',
    header: 'Message',
    cell: info => (
      <div className="font-mono text-sm whitespace-pre-wrap max-w-xl py-2">
        {info.getValue() as string}
      </div>
    )
  },
  {
    accessorKey: 'metadata',
    header: 'Metadata',
    cell: info => {
      const metadata = info.getValue() as Log['metadata'];
      if (!metadata || metadata.length === 0) return <div className="text-xs text-muted-foreground">-</div>;

      const visibleMetadata = metadata.slice(0, 2);
      const hasMore = metadata.length > 2;

      return (
        <div className="max-w-xs">
          <div className="font-mono text-xs bg-muted rounded p-2 whitespace-pre-wrap overflow-auto max-h-24">
            {visibleMetadata.map(meta => (
              <div key={meta.key} className="mb-1 truncate">
                <span className="text-muted-foreground">{meta.key}:</span>{" "}
                <span title={String(meta.value)}>{String(meta.value)}</span>
              </div>
            ))}
            {hasMore && (
              <div className="text-muted-foreground text-xs mt-1">
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
          className="rounded-full hover:bg-primary/10"
          aria-label="View log details"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </Button>
      );
    },
    size: 50,
  }
]; 