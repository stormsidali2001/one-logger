import { useState, useMemo } from 'react';
import { useProjects } from '../hooks/queries/useProjects';
import type{ Project } from '@/types/project';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectFormModal } from '../components/projects/ProjectFormModal';
import { ConfirmDialog } from '../components/projects/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Search, Plus, FolderOpen, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectsPage() {
  const { data: projects, createProject, updateProject, deleteProject, isLoading, isError } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!projects || !searchQuery.trim()) return projects;
    return projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <FolderOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Projects
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and organize your logging projects
              </p>
            </div>
          </div>
          
          {/* Stats and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4">
              <Badge variant="secondary" className="px-3 py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                {projects?.length || 0} Projects
              </Badge>
              {projects && projects.length > 0 && (
                <Badge variant="outline" className="px-3 py-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Latest: {new Date(Math.max(...projects.map(p => new Date(p.createdAt).getTime()))).toLocaleDateString()}
                </Badge>
              )}
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
              </div>
              <Button
                onClick={handleNew}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <div className="text-red-500 text-lg font-medium mb-2">Error loading projects</div>
              <p className="text-red-600">Please try refreshing the page or contact support if the issue persists.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && projects && projects.length === 0 && (
          <Card className="border-dashed border-2 border-gray-300 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Get started by creating your first project. Projects help you organize and manage your logs efficiently.
              </p>
              <Button
                onClick={handleNew}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredProjects && filteredProjects.length > 0 && (
          <>
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-600">
                Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}

        {!isLoading && searchQuery && filteredProjects && filteredProjects.length === 0 && projects && projects.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <div className="text-yellow-600 text-lg font-medium mb-2">No projects found</div>
              <p className="text-yellow-700">No projects match your search for "{searchQuery}". Try a different search term.</p>
            </CardContent>
          </Card>
        )}
      </div>
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