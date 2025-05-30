import React from 'react';
import { useProjects } from '../../hooks/queries/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { FolderOpen, Plus, Activity, BarChart3 } from 'lucide-react';

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  const projectCount = projects?.length || 0;
  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between"></div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">
              {projectCount === 1 ? 'project' : 'projects'} created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Logging</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">
              Real-time log monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="text-xs text-muted-foreground">
              Log analysis available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="w-full">
              <Link to="/projects">
                New Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

        {/* Recent Projects */}
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Recent Projects</CardTitle>
                <CardDescription className="text-gray-600">
                  Your most recently created projects
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center gap-2 text-gray-500">
                  <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                  Loading projects...
                </div>
              </div>
            ) : recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white/80 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-10 w-10 bg-gradient-to-r ${getGradientColor(project.name)} text-white`}>
                        <AvatarFallback className="bg-transparent text-white font-medium">
                          {getInitials(project.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 max-w-md truncate">{project.description}</p>
                        )}
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="hover:bg-white hover:shadow-sm">
                      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <Button asChild variant="ghost" className="w-full justify-center">
                    <Link to="/projects">
                      View All Projects
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl w-fit mb-4">
                  <FolderOpen className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Create your first project to start monitoring and analyzing your application logs
                </p>
                <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                  <Link to="/projects">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}