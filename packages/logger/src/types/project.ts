export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface ProjectCreate {
  name: string;
  description?: string;
} 