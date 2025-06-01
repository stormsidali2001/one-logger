import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectTracesTableFooterProps {
  currentPage: number;
  hasNextPage: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLoading: boolean;
  currentTraceCount: number;
  pageSize: number;
}

export function ProjectTracesTableFooter({
  currentPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  isLoading,
  currentTraceCount,
  pageSize,
}: ProjectTracesTableFooterProps) {
  const canGoPrevious = currentPage > 0;
  const canGoNext = hasNextPage && !isLoading;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Page <span className="font-medium">{currentPage + 1}</span>
        </div>
        {currentTraceCount > 0 && (
          <div className="text-xs text-gray-500">
            Showing {currentTraceCount} traces
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={!canGoPrevious || isLoading}
          className="border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!canGoNext}
          className="border-gray-200 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}