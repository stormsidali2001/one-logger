import React, { useState } from 'react';
import { useProjects } from '../hooks/queries/useProjects';
import { Project } from '../types/project';

export default function ProjectsPage() {
  const { data: projects, createProject, updateProject, deleteProject, isLoading, isError } = useProjects();
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ name: '', description: '' });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    createProject.mutate(newProject, {
      onSuccess: () => setNewProject({ name: '', description: '' }),
    });
  };

  const handleEdit = (project: Project) => {
    setEditProjectId(project.id);
    setEditData({ name: project.name, description: project.description });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProjectId) return;
    updateProject.mutate({ id: editProjectId, data: editData }, {
      onSuccess: () => setEditProjectId(null),
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this project?')) {
      deleteProject.mutate(id);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Projects</h2>
      <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Project name"
          value={newProject.name}
          onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newProject.description}
          onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
        />
        <button type="submit" disabled={createProject.isPending}>Add Project</button>
      </form>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error loading projects.</div>}
      <ul>
        {projects?.map(project => (
          <li key={project.id} style={{ marginBottom: 16 }}>
            {editProjectId === project.id ? (
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                  required
                />
                <input
                  type="text"
                  value={editData.description}
                  onChange={e => setEditData(d => ({ ...d, description: e.target.value }))}
                />
                <button type="submit" disabled={updateProject.isPending}>Save</button>
                <button type="button" onClick={() => setEditProjectId(null)}>Cancel</button>
              </form>
            ) : (
              <>
                <strong>{project.name}</strong> <span>({project.description})</span>
                <button onClick={() => handleEdit(project)} style={{ marginLeft: 8 }}>Edit</button>
                <button onClick={() => handleDelete(project.id)} style={{ marginLeft: 8 }}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 