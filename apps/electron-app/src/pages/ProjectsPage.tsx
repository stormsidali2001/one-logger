import React, { useState } from 'react';
import { useProjects } from '../hooks/queries/useProjects';
import { Project } from '../types/project';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { ConfirmDialog } from '../components/projects/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { data: projects, createProject, updateProject, deleteProject, isLoading, isError } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Handlers
  const handleNew = () => {
    setEditProject(null);
    setModalMode('create');
    setModalOpen(true);
  };
  const handleEdit = (project: Project) => {
    setEditProject(project);
    setModalMode('edit');
    setModalOpen(true);
  };
  const handleDelete = (project: Project) => {
    setDeleteProjectId(project.id);
  };
  const handleModalSubmit = (data: { name: string; description: string }) => {
    if (modalMode === 'create') {
      createProject.mutate(data, {
        onSuccess: () => {
          setModalOpen(false);
          toast.success('Project created');
        },
        onError: () => toast.error('Failed to create project'),
      });
    } else if (editProject) {
      updateProject.mutate({ id: editProject.id, data }, {
        onSuccess: () => {
          setModalOpen(false);
          toast.success('Project updated');
        },
        onError: () => toast.error('Failed to update project'),
      });
    }
  };
  const handleConfirmDelete = () => {
    if (!deleteProjectId) return;
    deleteProject.mutate(deleteProjectId, {
      onSuccess: () => {
        setDeleteProjectId(null);
        toast.success('Project deleted');
      },
      onError: () => toast.error('Failed to delete project'),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 relative">
      <h2 className="text-2xl font-bold mb-6">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-16">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
        {isError && <div className="col-span-full text-red-500">Error loading projects.</div>}
        {!isLoading && projects && projects.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground">No projects yet. Create your first project!</div>
        )}
        {projects?.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <Button
        className="fixed bottom-8 right-8 rounded-full shadow-lg px-6 py-3 text-lg"
        onClick={handleNew}
      >
        + New Project
      </Button>
      <ProjectFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={modalMode === 'edit' && editProject ? { name: editProject.name, description: editProject.description } : undefined}
        onSubmit={handleModalSubmit}
        loading={createProject.isPending || updateProject.isPending}
        mode={modalMode}
      />
      <ConfirmDialog
        open={!!deleteProjectId}
        onOpenChange={open => !open && setDeleteProjectId(null)}
        title="Delete Project?"
        description="This will delete the project and all its logs. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        loading={deleteProject.isPending}
        confirmLabel="Delete"
      />
    </div>
  );
} 