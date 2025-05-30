import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProjectLogsTableFooterProps {
  currentPage: number;
  hasNextPage?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLoading: boolean;
  currentLogCount: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  totalPages?: number;
  onGoToFirstPage?: () => void;
  onGoToLastPage?: () => void;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function ProjectLogsTableFooter({
  currentPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  isLoading,
  currentLogCount,
  pageSize = 20,
  onPageSizeChange,
  totalPages,
  onGoToFirstPage,
  onGoToLastPage
}: ProjectLogsTableFooterProps) {
  const showAdvancedControls = onGoToFirstPage && onGoToLastPage;
  const showPageSizeSelector = onPageSizeChange;
  
  return (
    <CardFooter className="border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-blue-50/50 backdrop-blur-sm p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      {/* Left side - Page info and status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 order-2 lg:order-1">
        <div className="text-sm text-muted-foreground">
          {currentLogCount > 0 ? (
            <div className="flex items-center gap-2">
              <span>Page {currentPage + 1}</span>
              {totalPages && (
                <span className="text-muted-foreground/60">of {totalPages}</span>
              )}
              {hasNextPage && !totalPages && (
                <Badge variant="secondary" className="text-xs">
                  More available
                </Badge>
              )}
            </div>
          ) : (
            <>{!isLoading && <>No logs to display</>}</>
          )}
        </div>
        
        {/* Page size selector */}
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        {/* Current page info */}
        <div className="text-sm text-gray-600 font-medium">
          Showing {currentLogCount} {currentLogCount === 1 ? 'log' : 'logs'}
        </div>
      </div>

      {/* Right side - Navigation controls */}
      <div className="flex items-center justify-center sm:justify-end gap-1 order-1 lg:order-2">
        {/* First page button (if advanced controls enabled) */}
        {showAdvancedControls && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToFirstPage}
            disabled={currentPage === 0 || isLoading}
            className="h-9 w-9 p-0 bg-white/80 hover:bg-blue-50 border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 0 || isLoading}
          className="h-9 px-3 bg-white/80 hover:bg-blue-50 border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        
        {/* Page indicator */}
        <div className="flex items-center justify-center min-w-[60px] h-9 px-3 text-sm font-semibold bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-md text-blue-700">
          {currentPage + 1}
        </div>
        
        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="h-9 px-3 bg-white/80 hover:bg-blue-50 border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
        
        {/* Last page button (if advanced controls enabled) */}
        {showAdvancedControls && totalPages && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToLastPage}
            disabled={!hasNextPage || isLoading}
            className="h-9 w-9 p-0 bg-white/80 hover:bg-blue-50 border-gray-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            title="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </CardFooter>
  );
}