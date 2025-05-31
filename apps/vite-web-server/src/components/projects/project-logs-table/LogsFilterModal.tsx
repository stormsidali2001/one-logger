import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Filter } from "lucide-react";

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";
export interface MetadataFilter {
  key: string;
  value: string;
}
export interface LogsFilterState {
  levels: LogLevel[];
  fromDate: string;
  toDate: string;
  metadata: MetadataFilter[];
}

interface LogsFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LogsFilterState;
  onApply: (filters: LogsFilterState) => void;
  onReset: () => void;
  projectId: string;
}

const LOG_LEVELS: LogLevel[] = ["error", "warn", "info", "debug", "trace"];

export function LogsFilterModal({ open, onOpenChange, filters, onApply, onReset, projectId }: LogsFilterModalProps) {
  const [localFilters, setLocalFilters] = useState<LogsFilterState>(filters);
  const [metaKey, setMetaKey] = useState("");
  const [metaValue, setMetaValue] = useState("");


  // Sync local state with props
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, open]);

  const handleLevelChange = (level: LogLevel, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      levels: checked ? [...prev.levels, level] : prev.levels.filter((l) => l !== level),
    }));
  };

  const handleAddMetadata = () => {
    if (metaKey && metaValue) {
      setLocalFilters((prev) => ({
        ...prev,
        metadata: [...prev.metadata, { key: metaKey, value: metaValue }],
      }));
      setMetaKey("");
      setMetaValue("");
    }
  };

  const handleRemoveMetadata = (index: number) => {
    setLocalFilters((prev) => ({
      ...prev,
      metadata: prev.metadata.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Logs
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Log Level */}
          <div>
            <Label className="mb-2 block">Log Levels</Label>
            <div className="flex flex-wrap gap-2">
              {LOG_LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={localFilters.levels.includes(level) ? "default" : "outline"}
                  size="sm"
                  className="capitalize"
                  onClick={() => handleLevelChange(level, !localFilters.levels.includes(level))}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          {/* Date Range */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="from-date">From</Label>
              <Input
                id="from-date"
                type="date"
                value={localFilters.fromDate}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, fromDate: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="to-date">To</Label>
              <Input
                id="to-date"
                type="date"
                value={localFilters.toDate}
                onChange={(e) => setLocalFilters((prev) => ({ ...prev, toDate: e.target.value }))}
              />
            </div>
          </div>
          {/* Metadata Filters */}
          <div>
            <Label className="mb-2 block">Metadata Filters</Label>
            <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Key"
                  value={metaKey}
                  onChange={(e) => setMetaKey(e.target.value)}
                  className="flex-1"
                />
              <Input
                placeholder="Value"
                value={metaValue}
                onChange={(e) => setMetaValue(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddMetadata} disabled={!metaKey || !metaValue}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {localFilters.metadata.map((meta, idx) => (
                <Badge key={idx} variant="secondary" className="pl-2 flex items-center gap-1">
                  <span className="font-semibold">{meta.key}:</span> {meta.value}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMetadata(idx)}
                    className="h-4 w-4 p-0 ml-1 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6 flex gap-2">
          <Button variant="outline" onClick={onReset}>
            Reset
          </Button>
          <Button
            onClick={() => onApply(localFilters)}
            variant="default"
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 