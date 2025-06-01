import { createFileRoute, Link } from '@tanstack/react-router';
import { useProjects } from '../hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FolderOpen, 
  Plus, 
  Settings, 
  HelpCircle, 
  BarChart3,
  Activity,
  Calendar,
  Sparkles,
  ArrowRight,
  FileText,
  Zap
} from 'lucide-react';

export const Route = createFileRoute('/')({ 
  component: Dashboard,
});

function Dashboard() {
  const { data: projects, isLoading } = useProjects();

  const recentProjects = projects?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome to One Logger - Monitor and manage your application logs
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white">
                  <FolderOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {isLoading ? '...' : projects?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Projects</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">System Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Ready</div>
                  <div className="text-sm text-gray-600">Log Collection</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg text-white">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold">Live</div>
                  <div className="text-sm text-gray-600">Real-time Monitoring</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    Recent Projects
                  </CardTitle>
                  <Link to="/projects">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View All
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-lg border bg-background animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentProjects.length > 0 ? (
                  <div className="space-y-4">
                    {recentProjects.map((project) => (
                      <Link key={project.id} to={`/projects/${project.id}`}>
                        <div className="flex items-center gap-3 p-4 rounded-lg border bg-background hover:border-primary/30 transition-all hover:shadow-md cursor-pointer">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                            <FolderOpen className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-gray-600">{project.description}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(project.createdAt).toLocaleDateString()}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <FolderOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                    <p className="text-gray-600 mb-4">Create your first project to start logging</p>
                    <Link to="/projects">
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Project
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-b border-gray-200/50">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-r from-green-500 to-teal-500 rounded text-white">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Link to="/projects">
                    <Button variant="outline" className="w-full justify-start hover:border-blue-300 hover:bg-blue-50">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Project
                    </Button>
                  </Link>
                  <Link to="/projects">
                    <Button variant="outline" className="w-full justify-start hover:border-purple-300 hover:bg-purple-50">
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse Projects
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="outline" className="w-full justify-start hover:border-gray-300 hover:bg-gray-50">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link to="/help">
                    <Button variant="outline" className="w-full justify-start hover:border-green-300 hover:bg-green-50">
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Help & Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}