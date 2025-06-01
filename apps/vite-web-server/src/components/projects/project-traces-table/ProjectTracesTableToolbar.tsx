import { Search, Filter, Trash2, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProjectTracesTableToolbarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onOpenFilterModal: () => void;
  selectedCount: number;
  onDeleteSelected: () => void;
  onExportSelected: () => void;
  onCopySelected: () => void;
  isLoading: boolean;
}

export function ProjectTracesTableToolbar({
  searchQuery,
  onSearchQueryChange,
  onOpenFilterModal,
  selectedCount,
  onDeleteSelected,
  onExportSelected,
  onCopySelected,
  isLoading,
}: ProjectTracesTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search traces..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onOpenFilterModal}
          className="border-gray-200 hover:bg-gray-50"
          disabled={isLoading}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {selectedCount > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} selected
            </Badge>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCopySelected}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportSelected}
                className="border-gray-200 hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteSelected}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}