import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart,
  AreaChart,
  PieChart,
  Bar, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  Cell,
  Pie,
  Sector
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useProjectMetrics } from "@/hooks/queries/useProjectMetrics";
import { ProjectMetrics } from "@/types/log";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart as PieChartIcon, ActivityIcon, Clock } from "lucide-react";

interface ProjectMetricsTabProps {
  projectId: string;
}

// Generate dummy data for log trends - in a real app, you would fetch this from the API
const generateLogTrendData = (metrics: ProjectMetrics) => {
  // Last 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Generate data for info, warn, and error logs
  return days.map((day, index) => {
    // Make the last day match the metrics data
    if (index === 6) {
      const totalLogs = metrics.todaysLogs;
      const errorLogs = metrics.todaysErrors;
      // Estimate warn logs as approximately 15% of total
      const warnLogs = Math.round(totalLogs * 0.15);
      // Info logs are the remaining logs
      const infoLogs = totalLogs - errorLogs - warnLogs;
      
      return {
        name: day,
        info: infoLogs,
        warn: warnLogs,
        error: errorLogs,
      };
    }
    
    // Random data for other days
    const totalLogs = Math.floor(Math.random() * (metrics.totalLogs / 3)) + 1;
    const errorLogs = Math.floor(Math.random() * (totalLogs / 5));
    const warnLogs = Math.floor(Math.random() * (totalLogs / 4));
    const infoLogs = totalLogs - errorLogs - warnLogs;
    
    return {
      name: day,
      info: infoLogs,
      warn: warnLogs,
      error: errorLogs,
    };
  });
};

// Generate dummy data for log level distribution
const generateLogLevelData = (metrics: ProjectMetrics) => {
  const totalErrors = metrics.totalErrors;
  const totalLogs = metrics.totalLogs;
  const estimatedWarnings = Math.round(totalLogs * 0.15); // Estimate 15% are warnings
  const estimatedInfo = totalLogs - totalErrors - estimatedWarnings;
  
  return [
    { name: "info", value: estimatedInfo, color: "#3b82f6" },
    { name: "warn", value: estimatedWarnings, color: "#f59e0b" },
    { name: "error", value: totalErrors, color: "#ef4444" },
  ];
};

export function ProjectMetricsTab({ projectId }: ProjectMetricsTabProps) {
  const { data: metrics, isLoading } = useProjectMetrics(projectId);

  const logTrendData = useMemo(() => {
    if (!metrics) return [];
    return generateLogTrendData(metrics);
  }, [metrics]);

  const logLevelData = useMemo(() => {
    if (!metrics) return [];
    return generateLogLevelData(metrics);
  }, [metrics]);
  
  const chartConfig = {
    info: {
      label: "Info",
      color: "#3b82f6",
    },
    warn: {
      label: "Warnings",
      color: "#f59e0b",
    },
    error: {
      label: "Errors",
      color: "#ef4444",
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">No metrics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Log Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ChartContainer config={chartConfig}>
              <AreaChart
                data={logTrendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                />
                <Area 
                  type="monotone" 
                  dataKey="info" 
                  stackId="1" 
                  stroke="#3b82f6" 
                  fill="#3b82f6"
                  name="Info"
                />
                <Area 
                  type="monotone" 
                  dataKey="warn" 
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="#f59e0b" 
                  name="Warnings"
                />
                <Area 
                  type="monotone" 
                  dataKey="error" 
                  stackId="1" 
                  stroke="#ef4444" 
                  fill="#ef4444" 
                  name="Errors"
                />
                <Legend />
              </AreaChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Log Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={logLevelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {logLevelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} logs`, 'Count']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Log Level Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={[
                    {
                      name: "Total",
                      info: metrics.totalLogs - metrics.totalErrors - Math.round(metrics.totalLogs * 0.15),
                      warn: Math.round(metrics.totalLogs * 0.15),
                      error: metrics.totalErrors,
                    },
                    {
                      name: "Today",
                      info: metrics.todaysLogs - metrics.todaysErrors - Math.round(metrics.todaysLogs * 0.15),
                      warn: Math.round(metrics.todaysLogs * 0.15),
                      error: metrics.todaysErrors,
                    },
                  ]}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                  />
                  <Bar stackId="a" dataKey="info" name="Info" fill="#3b82f6" />
                  <Bar stackId="a" dataKey="warn" name="Warnings" fill="#f59e0b" />
                  <Bar stackId="a" dataKey="error" name="Errors" fill="#ef4444" />
                  <Legend />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity Section */}
      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Last Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.lastActivity ? (
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {new Date(metrics.lastActivity.timestamp).toLocaleString()}
                </div>
                <Badge 
                  className={`${
                    metrics.lastActivity.level === 'error' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : metrics.lastActivity.level === 'warn'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {metrics.lastActivity.level.toUpperCase()}
                </Badge>
              </div>
              <div className="font-mono text-sm p-2 rounded bg-muted whitespace-pre-wrap border">
                {metrics.lastActivity.message}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-6">
              <p className="text-muted-foreground">No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 