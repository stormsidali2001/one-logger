import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Trash, Download, Copy, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectLogsTableToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onOpenFilterModal: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
  onCopySelected: () => void;
  isLoading: boolean;
}

export function ProjectLogsTableToolbar({
  searchQuery,
  onSearchQueryChange,
  onOpenFilterModal,
  selectedCount,
  onDeleteSelected,
  onExportSelected,
  onCopySelected,
  isLoading,
}: ProjectLogsTableToolbarProps) {

  const handleBatchDelete = () => {
    // Actual deletion logic will be in the main component or a hook
    onDeleteSelected(); 
  };

  const handleBatchExport = () => {
    onExportSelected();
  };

  const handleBatchCopy = () => {
    onCopySelected();
  };

  return (
    <div className="p-4 space-y-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search log messages (press Enter to apply)..."
            value={searchQuery}
            onChange={e => onSearchQueryChange(e.target.value)}
            className="h-10 pl-8 pr-4 md:pr-14 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            disabled={isLoading}
            // onKeyUp={(e) => { if (e.key === 'Enter') { /* props.onApplySearch() or similar */ } }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="h-10" // Matched height with Input
            onClick={onOpenFilterModal}
            variant="outline"
            disabled={isLoading}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          {selectedCount > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Actions ({selectedCount})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBatchCopy}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBatchExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBatchDelete} className="text-red-600 focus:text-red-700 focus:bg-red-50">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}