import { useLogs } from '../hooks/queries/useLogs';
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from '@tanstack/react-table';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table';
import { Log } from '../types/log';

const columns: ColumnDef<Log>[] = [
  { accessorKey: 'projectId', header: 'Project ID' },
  { accessorKey: 'level', header: 'Level' },
  { accessorKey: 'message', header: 'Message' },
  { accessorKey: 'timestamp', header: 'Timestamp' },
  {
    accessorKey: 'meta',
    header: 'Meta',
    cell: info => JSON.stringify(info.getValue()),
  },
];

export default function LogsPage() {
  const { data: logs = [], isLoading, isError } = useLogs();

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <h2>All Logs</h2>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading logs.</div>}
      <Table>
        <TableHeader>
          <TableRow>
            {table.getHeaderGroups()[0].headers.map(header => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 