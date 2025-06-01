import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Edit, 
  Trash, 
  ChevronRight,
  ArrowRightCircle,
  RefreshCw,
  Trash2
} from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ProjectHeaderProps {
  project: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
  };
  isRefreshing: boolean;
  autoRefresh: boolean;
  onAutoRefreshChange: (checked: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
  onClearLogs?: () => void;
  onRefresh: () => void;
}

export function ProjectHeader({
  project,
  isRefreshing,
  autoRefresh,
  onAutoRefreshChange,
  onEdit,
  onDelete,
  onClearLogs,
  onRefresh
}: ProjectHeaderProps) {
  const createdDate = new Date(project.createdAt);
  const formattedDate = createdDate.toLocaleDateString();
  const formattedTime = createdDate.toLocaleTimeString();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg p-6 rounded-lg">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Link 
            to="/projects" 
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center"
          >
            <ArrowRightCircle className="h-3.5 w-3.5 mr-1 rotate-180" />
            Projects
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{project.name}</span>
        </div>
        
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          {project.name}
        </h1>
        
        {project.description && (
          <p className="text-muted-foreground max-w-2xl">{project.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Badge variant="outline" className="font-mono text-xs">
            {project.id}
          </Badge>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formattedDate}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formattedTime}
          </div>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4 md:mt-0 items-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEdit} 
          className="transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        {onClearLogs && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearLogs} 
            className="transition-all hover:border-orange-500/50 hover:bg-orange-50 text-orange-600 hover:text-orange-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        )}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onDelete} 
          className="transition-all hover:bg-destructive/90"
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="transition-all hover:border-primary/50 hover:bg-primary/5"
        >
          {isRefreshing ? (
            <span className="mr-2 border-2 border-primary/30 border-t-primary rounded-full w-4 h-4 animate-spin inline-block" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
        <div className="flex items-center ml-2">
          <span className="text-xs text-muted-foreground mr-2">Auto-refresh</span>
          <Switch
            checked={autoRefresh}
            onCheckedChange={onAutoRefreshChange}
            disabled={isRefreshing}
            id="auto-refresh-toggle"
          />
        </div>
      </div>
    </div>
  );
}