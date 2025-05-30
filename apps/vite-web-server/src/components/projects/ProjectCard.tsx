import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Project } from '../../types/project';
import { Calendar, Edit, Trash2, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGradientColor = (name: string) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Card className="group overflow-hidden bg-white/80 backdrop-blur-sm border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className={`h-12 w-12 bg-gradient-to-r ${getGradientColor(project.name)} text-white font-bold shadow-lg`}>
            <AvatarFallback className="bg-transparent text-white">
              {getInitials(project.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 mt-1">
              {project.description || 'No description provided'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar className="h-3 w-3" />
          <span>Created {formatDate(project.createdAt)}</span>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          Active Project
        </Badge>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Link to={`/projects/${project.id}`} className="flex-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            View
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEdit(project)}
          className="hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Edit className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(project)}
          className="hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}