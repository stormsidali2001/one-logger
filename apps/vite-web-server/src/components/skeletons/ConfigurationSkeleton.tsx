import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Server, Brain, LucideIcon } from "lucide-react";

interface ConfigurationSkeletonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconGradient: string;
  showCorsSection?: boolean;
  showRestartNotification?: boolean;
}

export function ConfigurationSkeleton({
  title,
  description,
  icon: Icon,
  iconGradient,
  showCorsSection = false,
  showRestartNotification = false
}: ConfigurationSkeletonProps) {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 ${iconGradient} rounded-lg text-white`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold">
                {title}
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                {description}
              </CardDescription>
            </div>
          </div>
          <Skeleton className="h-6 w-16" /> {/* Status badge */}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Server Status Toggle */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Skeleton className="h-4 w-24" /> {/* Label */}
            <Skeleton className="h-3 w-40" /> {/* Description */}
          </div>
          <Skeleton className="h-6 w-11 rounded-full" /> {/* Switch */}
        </div>

        <Separator />

        {/* Port Configuration */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" /> {/* Port label */}
          <Skeleton className="h-10 w-full" /> {/* Port input */}
          <Skeleton className="h-3 w-64" /> {/* Port description */}
        </div>

        {showCorsSection && (
          <>
            <Separator />
            
            {/* CORS Origins Section */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" /> {/* CORS label */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 flex-1" /> {/* CORS input */}
                <Skeleton className="h-10 w-16" /> {/* Add button */}
              </div>
              <Skeleton className="h-3 w-72" /> {/* CORS description */}
              
              {/* CORS Origins List */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Skeleton className="h-6 w-32" /> {/* CORS origin badge 1 */}
                <Skeleton className="h-6 w-28" /> {/* CORS origin badge 2 */}
                <Skeleton className="h-6 w-36" /> {/* CORS origin badge 3 */}
              </div>
            </div>
          </>
        )}

        {showRestartNotification && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-md p-4 mt-6">
            <div className="flex items-start">
              <Skeleton className="h-5 w-5 mt-0.5" /> {/* Info icon */}
              <div className="ml-3 space-y-2">
                <Skeleton className="h-4 w-48" /> {/* Restart title */}
                <Skeleton className="h-3 w-80" /> {/* Restart description */}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end gap-3 pt-2">
        <Skeleton className="h-10 w-32" /> {/* Restart Later button */}
        <Skeleton className="h-10 w-28" /> {/* Save Changes button */}
      </CardFooter>
    </Card>
  );
}

// Predefined configurations for common use cases
export function ServerConfigurationSkeleton() {
  return (
    <ConfigurationSkeleton
      title="Server Configuration"
      description="Configure the built-in API server for receiving logs"
      icon={Server}
      iconGradient="bg-gradient-to-r from-blue-500 to-cyan-500"
      showCorsSection={true}
      showRestartNotification={true}
    />
  );
}

export function MCPServerConfigurationSkeleton() {
  return (
    <ConfigurationSkeleton
      title="MCP Server Configuration"
      description="Configure the Model Context Protocol server for AI agent access"
      icon={Brain}
      iconGradient="bg-gradient-to-r from-purple-500 to-pink-500"
      showCorsSection={false}
      showRestartNotification={true}
    />
  );
}