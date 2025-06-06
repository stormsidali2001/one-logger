import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare } from "lucide-react";

interface ServerLogsSkeletonProps {
  title?: string;
  description?: string;
}

export function ServerLogsSkeleton({ 
  title = "Server Logs", 
  description = "View server stdout and stderr logs" 
}: ServerLogsSkeletonProps) {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <TerminalSquare className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-28" /> {/* Standard Output button */}
            <Skeleton className="h-8 w-20" /> {/* Standard Error button */}
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-20" /> {/* Auto-refresh label */}
            <Skeleton className="h-6 w-11 rounded-full" /> {/* Switch */}
            <Skeleton className="h-8 w-8" /> {/* Refresh button */}
            <Skeleton className="h-8 w-8" /> {/* Clear button */}
          </div>
        </div>
        
        <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-96 overflow-y-auto">
          <div className="space-y-2">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton 
                key={i} 
                className="h-4 bg-gray-800" 
                style={{ width: `${Math.random() * 40 + 60}%` }} // Random widths for realistic look
              />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-3 w-36" /> {/* Log count text */}
        <Skeleton className="h-8 w-28" /> {/* Clear All Logs button */}
      </CardFooter>
    </Card>
  );
}

export function MCPServerLogsSkeleton() {
  return (
    <ServerLogsSkeleton 
      title="MCP Server Logs" 
      description="View MCP server stdout and stderr logs" 
    />
  );
}