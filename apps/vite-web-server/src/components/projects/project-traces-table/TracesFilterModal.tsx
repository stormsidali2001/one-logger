import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface TracesFilters {
  status: string[];
  fromDate?: string;
  toDate?: string;
  minDuration?: number;
  maxDuration?: number;
}

interface TracesFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TracesFilters;
  onApply: (filters: TracesFilters) => void;
  onReset: () => void;
  projectId: string;
}

const STATUS_OPTIONS = [
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
];

export function TracesFilterModal({
  open,
  onOpenChange,
  filters,
  onApply,
  onReset,
  projectId,
}: TracesFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<TracesFilters>(filters);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    filters.fromDate ? new Date(filters.fromDate) : undefined
  );
  const [toDate, setToDate] = useState<Date | undefined>(
    filters.toDate ? new Date(filters.toDate) : undefined
  );

  useEffect(() => {
    setLocalFilters(filters);
    setFromDate(filters.fromDate ? new Date(filters.fromDate) : undefined);
    setToDate(filters.toDate ? new Date(filters.toDate) : undefined);
  }, [filters]);

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      status: checked
        ? [...prev.status, status]
        : prev.status.filter(s => s !== status)
    }));
  };

  const handleApply = () => {
    const updatedFilters = {
      ...localFilters,
      fromDate: fromDate ? fromDate.toISOString() : undefined,
      toDate: toDate ? toDate.toISOString() : undefined,
    };
    onApply(updatedFilters);
  };

  const handleReset = () => {
    setLocalFilters({ status: [] });
    setFromDate(undefined);
    setToDate(undefined);
    onReset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Traces</DialogTitle>
          <DialogDescription>
            Apply filters to narrow down the traces displayed in the table.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={localFilters.status.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleStatusChange(option.value, !!checked)
                    }
                  />
                  <Label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Date Range</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-xs text-gray-500">From</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-xs text-gray-500">To</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Duration Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Duration (ms)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="min-duration" className="text-xs text-gray-500">Min</Label>
                <Input
                  id="min-duration"
                  type="number"
                  placeholder="0"
                  value={localFilters.minDuration || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    minDuration: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-duration" className="text-xs text-gray-500">Max</Label>
                <Input
                  id="max-duration"
                  type="number"
                  placeholder="1000"
                  value={localFilters.maxDuration || ''}
                  onChange={(e) => setLocalFilters(prev => ({
                    ...prev,
                    maxDuration: e.target.value ? Number(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}