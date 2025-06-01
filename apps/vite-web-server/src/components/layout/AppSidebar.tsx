import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HomeIcon, FolderIcon, ChevronDown, Settings, Sparkles, Calendar, ExternalLink, HelpCircle, Info } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useProjects } from "@/hooks/queries/useProjects";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const [openProjects, setOpenProjects] = useState(true);
  const { data: projects, isLoading: projectsLoading } = useProjects();

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
    <Sidebar className="bg-gradient-to-b from-slate-50 to-blue-50 border-r border-gray-200">
      <SidebarHeader className="px-6 py-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white shadow-lg">
            <span className="text-xl font-bold">🧩</span>
          </div>
          <div>
            <h2 className="font-bold text-lg bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              One Logger
            </h2>
            <p className="text-xs text-gray-500">Logging Dashboard</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-600 font-medium mb-3 flex items-center gap-2">
            <Sparkles className="h-3 w-3" />
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu className="space-y-1">
            <SidebarMenuItem>
              <Link to="/">
                <SidebarMenuButton 
                  isActive={isActive("/")} 
                  className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg"
                >
                  <HomeIcon className="h-4 w-4 mr-3" />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            {/* Projects collapsible group */}
            <Collapsible open={openProjects} onOpenChange={setOpenProjects}>
              <li>
                <CollapsibleTrigger className="flex items-center w-full">
                  <SidebarMenuButton 
                    isActive={currentPath.startsWith("/projects")} 
                    className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg"
                  >
                    <FolderIcon className="h-4 w-4 mr-3" />
                    Projects
                    <div className="ml-auto flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs px-2 py-0.5">
                        {projects?.length || 0}
                      </Badge>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openProjects ? "rotate-180" : ""}`} />
                    </div>
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </li>
              <CollapsibleContent className="mt-2">
                <SidebarMenu className="ml-4 space-y-1">
                  <SidebarMenuItem>
                    <Link to="/projects">
                      <SidebarMenuButton 
                        isActive={currentPath === "/projects"} 
                        className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg text-sm"
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        All Projects
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  
                  {projectsLoading && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled className="text-sm text-gray-400">
                        <div className="h-3 w-3 mr-2 rounded-full bg-gray-300 animate-pulse" />
                        Loading...
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {projects && projects.length === 0 && !projectsLoading && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled className="text-sm text-gray-400">
                        <div className="h-3 w-3 mr-2 rounded-full bg-gray-200" />
                        No projects
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {projects?.slice(0, 5).map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <Link to="/projects/$projectId" params={{ projectId: project.id }}>
                        <SidebarMenuButton 
                          isActive={currentPath === `/projects/${project.id}`} 
                          className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg text-sm group"
                        >
                          <Avatar className={`h-5 w-5 mr-2 bg-gradient-to-r ${getGradientColor(project.name)} text-white text-xs`}>
                            <AvatarFallback className="bg-transparent text-white text-xs">
                              {getInitials(project.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate flex-1">{project.name}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                  
                  {projects && projects.length > 5 && (
                    <SidebarMenuItem>
                      <Link to="/projects">
                        <SidebarMenuButton className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg text-sm text-gray-500">
                          <span className="text-xs">+{projects.length - 5} more...</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  )}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            
            {/* Help menu item */}
            <SidebarMenuItem>
              <Link to="/help">
                <SidebarMenuButton 
                  isActive={isActive("/help")} 
                  className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg"
                >
                  <HelpCircle className="h-4 w-4 mr-3" />
                  Help
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            {/* About menu item */}
            <SidebarMenuItem>
              <Link to="/about">
                <SidebarMenuButton 
                  isActive={isActive("/about")} 
                  className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg"
                >
                  <Info className="h-4 w-4 mr-3" />
                  About
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            
            {/* Settings menu item */}
            <SidebarMenuItem>
              <Link to="/settings">
                <SidebarMenuButton 
                  isActive={isActive("/settings")} 
                  className="hover:bg-white/60 hover:shadow-sm transition-all duration-200 rounded-lg"
                >
                  <Settings className="h-4 w-4 mr-3" />
                  Settings
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-gray-200/50">
        <div className="text-center">
          <Badge variant="outline" className="text-xs px-3 py-1">
            <Calendar className="h-3 w-3 mr-1" />
            v1.0.0
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}