import  { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { useProjectMetrics } from "@/hooks/queries/useProjectMetrics";
import { useHistoricalLogCounts } from "@/hooks/queries/Logs/useHistoricalLogCounts";
import { ProjectMetrics } from "@/types/log";
import { Badge } from "@/components/ui/badge";
import { BarChart3, PieChart as PieChartIcon, ActivityIcon, Clock } from "lucide-react";

interface ProjectMetricsTabProps {
  projectId: string;
}

// Format date string from ISO format to user-friendly format
// Add special handling for today's date
const formatDate = (dateString: string) => {
  // Get the date part (YYYY-MM-DD) from ISO string if it contains time
  const datePart = dateString.includes('T') 
    ? dateString.split('T')[0]
    : dateString;
  
  // Get today's date in YYYY-MM-DD format for consistent comparison
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Check if the date is today by comparing strings directly
  const isToday = datePart === todayStr;
  
  if (isToday) {
    return 'Today';
  }
  
  // For other dates, create a date object and format it
  const date = new Date(datePart);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Generate log level distribution data using actual metrics
const generateLogLevelData = (metrics: ProjectMetrics) => {
  return [
    { name: "info", value: metrics.totalInfo, color: "#3b82f6" },
    { name: "warn", value: metrics.totalWarn, color: "#f59e0b" },
    { name: "error", value: metrics.totalErrors, color: "#ef4444" },
  ];
};

export function ProjectMetricsTab({ projectId }: ProjectMetricsTabProps) {
  const { data: metrics, isLoading: isLoadingMetrics } = useProjectMetrics(projectId);
  const { data: historicalData, isLoading: isLoadingHistorical } = useHistoricalLogCounts(projectId, 7);

  // Process historical data for the trend chart
  const logTrendData = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return [];
    
    // Get today's date in YYYY-MM-DD format
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Use the actual data without artificial distribution
    return historicalData.map(day => {
      const formattedDate = formatDate(day.date);
      const isToday = day.date === todayStr;
      
      return {
        name: formattedDate,
        info: day.info,
        warn: day.warn,
        error: day.error,
        isToday
      };
    });
  }, [historicalData]);

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

  const isLoading = isLoadingMetrics || isLoadingHistorical;

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

  // If no historical data is available, show a message in the trend chart area
  const hasHistoricalData = historicalData && historicalData.length > 0;

  return (
    <div className="space-y-10">
      <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
        <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white">
              <ActivityIcon className="h-4 w-4" />
            </div>
            Log Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          <div className="h-[400px] w-full">
            {hasHistoricalData ? (
              <>
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
                    <defs>
                      <linearGradient id="infoFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="warnFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="errorFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tick={(props) => {
                        const { x, y, payload } = props;
                        const isToday = logTrendData[payload.index]?.isToday;
                        
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text 
                              x={0} 
                              y={0} 
                              dy={16} 
                              textAnchor="middle" 
                              fill={isToday ? "#3b82f6" : "#666"}
                              fontWeight={isToday ? "bold" : "normal"}
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                    />
                    <YAxis />
                    <ChartTooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const isToday = payload[0].payload.isToday;
                          
                          return (
                            <div className="bg-background border rounded-md shadow-md p-3">
                              <p className={`font-semibold ${isToday ? "text-primary" : ""}`}>
                                {label}
                              </p>
                              <div className="mt-2 space-y-1">
                                {payload.map((entry, index) => (
                                  <p 
                                    key={`tooltip-${index}`} 
                                    style={{ color: entry.color }}
                                    className="text-sm flex justify-between"
                                  >
                                    <span>{entry.name}:</span>
                                    <span className="ml-4 font-mono">{entry.value}</span>
                                  </p>
                                ))}
                                <p className="text-sm text-muted-foreground pt-1 border-t mt-1">
                                  Total: {payload.reduce((sum, entry) => sum + (entry.value as number), 0)}
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="info" 
                      stackId="1" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#infoFill)"
                      name="Info"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="warn" 
                      stackId="1" 
                      stroke="#f59e0b" 
                      fillOpacity={1}
                      fill="url(#warnFill)"
                      name="Warnings"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="error" 
                      stackId="1" 
                      stroke="#ef4444" 
                      fillOpacity={1}
                      fill="url(#errorFill)"
                      name="Errors"
                    />
                    <Legend />
                  </AreaChart>
                </ChartContainer>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No historical data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-14">
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-500/10 to-teal-500/10 border-b border-gray-200/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-green-500 to-teal-500 rounded text-white">
                <PieChartIcon className="h-4 w-4" />
              </div>
              Log Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
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
                    labelLine={false}
                    animationDuration={800}
                    animationBegin={200}
                    animationEasing="ease-out"
                  >
                    {logLevelData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} logs (${
                        ((value as number) / metrics.totalLogs * 100).toFixed(1)
                      }%)`, 
                      name?.toString().toUpperCase()
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '0.75rem',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    formatter={(value) => <span style={{ color: '#666', fontSize: '0.875rem' }}>{value.toUpperCase()}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader className="pb-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-gray-200/50">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-orange-500 to-red-500 rounded text-white">
                <BarChart3 className="h-4 w-4" />
              </div>
              Log Level Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <div className="h-[300px] w-full">
              <ChartContainer config={chartConfig}>
                <BarChart
                  data={[
                    {
                      name: "Total",
                      info: metrics.totalInfo,
                      warn: metrics.totalWarn,
                      error: metrics.totalErrors,
                    },
                    {
                      name: "Today",
                      info: metrics.todaysInfo,
                      warn: metrics.todaysWarn,
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
                  <XAxis 
                    dataKey="name" 
                    tick={({ x, y, payload }) => (
                      <g transform={`translate(${x},${y})`}>
                        <text 
                          x={0} 
                          y={0} 
                          dy={16} 
                          textAnchor="middle" 
                          fill={payload.value === 'Today' ? "#3b82f6" : "#666"}
                          fontWeight={payload.value === 'Today' ? "bold" : "normal"}
                        >
                          {payload.value}
                        </text>
                      </g>
                    )}
                  />
                  <YAxis />
                  <ChartTooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const isToday = label === 'Today';
                        
                        return (
                          <div className="bg-background border rounded-md shadow-md p-3">
                            <p className={`font-semibold ${isToday ? "text-primary" : ""}`}>
                              {label}
                            </p>
                            <div className="mt-2 space-y-1">
                              {payload.map((entry, index) => (
                                <p 
                                  key={`tooltip-${index}`} 
                                  style={{ color: entry.color }}
                                  className="text-sm flex justify-between"
                                >
                                  <span>{entry.name}:</span>
                                  <span className="ml-4 font-mono">{entry.value}</span>
                                </p>
                              ))}
                              <p className="text-sm text-muted-foreground pt-1 border-t mt-1">
                                Total: {payload.reduce((sum, entry) => sum + (entry.value as number), 0)}
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <defs>
                    <linearGradient id="infoBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="warnBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.6}/>
                    </linearGradient>
                    <linearGradient id="errorBarFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <Bar stackId="a" dataKey="info" name="Info" fill="url(#infoBarFill)" radius={[4, 4, 0, 0]} />
                  <Bar stackId="a" dataKey="warn" name="Warnings" fill="url(#warnBarFill)" />
                  <Bar stackId="a" dataKey="error" name="Errors" fill="url(#errorBarFill)" />
                  <Legend />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Activity Section */}
      <Card className="border shadow-sm mt-14">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Last Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
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