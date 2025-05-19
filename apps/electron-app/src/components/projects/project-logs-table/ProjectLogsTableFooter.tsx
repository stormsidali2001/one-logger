import React from 'react';
import { CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectLogsTableFooterProps {
  currentPage: number;
  hasNextPage?: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
  isLoading: boolean;
  currentLogCount: number;
}

export function ProjectLogsTableFooter({
  currentPage,
  hasNextPage,
  onPrevPage,
  onNextPage,
  isLoading,
  currentLogCount
}: ProjectLogsTableFooterProps) {
  return (
    <CardFooter className="border-t p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="text-sm text-muted-foreground order-2 sm:order-1">
        {currentLogCount > 0 ? (
          <>
            Page {currentPage + 1}
            {hasNextPage && <span className="text-muted-foreground/60"> • More logs available</span>}
          </>
        ) : (
          <>{!isLoading && <>No logs to display</>}</> // Show only if not loading
        )}
      </div>
      <div className="flex items-center justify-between sm:justify-end gap-2 order-1 sm:order-2 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevPage}
          disabled={currentPage === 0 || isLoading}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="h-9 px-3"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </CardFooter>
  );
} 