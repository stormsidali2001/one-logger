import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Brain } from "lucide-react";

interface EndpointsSkeletonProps {
  title: string;
  description: string;
  endpointCount: number;
  gridCols?: string;
}

export function EndpointsSkeleton({
  title,
  description,
  endpointCount,
  gridCols = "sm:grid-cols-2"
}: EndpointsSkeletonProps) {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Link className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className={`grid grid-cols-1 gap-2 ${gridCols}`}>
            {Array.from({ length: endpointCount }, (_, i) => (
              <div key={i} className="rounded-md border p-4">
                <Skeleton className="h-4 w-20 mb-2" /> {/* Endpoint name */}
                <Skeleton className="h-3 w-48" /> {/* Endpoint URL */}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Predefined configurations for common use cases
export function ApiEndpointsSkeleton() {
  return (
    <EndpointsSkeleton
      title="API Endpoints"
      description="The server exposes these endpoints when enabled"
      endpointCount={3}
      gridCols="sm:grid-cols-2"
    />
  );
}

export function MCPEndpointSkeleton() {
  return (
    <EndpointsSkeleton
      title="MCP Endpoint"
      description="The MCP server exposes this endpoint when enabled"
      endpointCount={1}
      gridCols="grid-cols-1"
    />
  );
}

export function MCPToolsSkeleton() {
  return (
    <Card className="border shadow-sm mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Available MCP Tools
        </CardTitle>
        <CardDescription>
          Tools accessible to AI agents via the MCP protocol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="rounded-md border p-4">
                <Skeleton className="h-4 w-24 mb-2" /> {/* Tool name */}
                <Skeleton className="h-3 w-full mb-1" /> {/* Tool description line 1 */}
                <Skeleton className="h-3 w-3/4" /> {/* Tool description line 2 */}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}