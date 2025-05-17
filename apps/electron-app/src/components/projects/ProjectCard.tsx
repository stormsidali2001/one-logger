import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar } from '../ui/avatar';
import { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="flex items-center gap-4 p-4 shadow-sm hover:shadow-md transition-shadow">
      <Avatar className="bg-primary text-white font-bold">
        {project.name.slice(0, 2).toUpperCase()}
      </Avatar>
      <div className="flex-1">
        <div className="font-semibold text-lg">{project.name}</div>
        <div className="text-muted-foreground text-sm mb-1">{project.description}</div>
        <div className="text-xs text-gray-400">Created: {new Date(project.createdAt).toLocaleString()}</div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onEdit(project)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onDelete(project)}>
          Delete
        </Button>
      </div>
    </Card>
  );
} 