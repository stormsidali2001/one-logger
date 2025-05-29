export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
}