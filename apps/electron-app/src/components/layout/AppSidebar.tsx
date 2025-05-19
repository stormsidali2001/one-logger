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
import { HomeIcon, FolderIcon,  ChevronDown, Settings } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { useProjects } from "@/hooks/queries/useProjects";

export function AppSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const [openProjects, setOpenProjects] = useState(false);
  const { data: projects, isLoading: projectsLoading } = useProjects();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center gap-3 px-4 py-4 border-b">
        <span className="text-3xl">🧩</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Demo</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link to="/">
                <SidebarMenuButton isActive={isActive("/")}>
                  <HomeIcon className="h-4 w-4 mr-2" />
                  SQLite + Drizzle Demo
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {/* Projects collapsible group */}
            <Collapsible open={openProjects} onOpenChange={setOpenProjects}>
              <li>
                <CollapsibleTrigger className="flex items-center w-full">
                  <SidebarMenuButton isActive={currentPath.startsWith("/projects")}> 
                    <FolderIcon className="h-4 w-4 mr-2" />
                    Projects
                    <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openProjects ? "rotate-180" : ""}`} />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </li>
              <CollapsibleContent>
                <SidebarMenu className="ml-6">
                  <SidebarMenuItem>
                    <Link to="/projects">
                      <SidebarMenuButton isActive={currentPath === "/projects"}>
                        All Projects
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {projectsLoading && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>Loading...</SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {projects && projects.length === 0 && (
                    <SidebarMenuItem>
                      <SidebarMenuButton disabled>No projects</SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  {projects?.map((project) => (
                    <SidebarMenuItem key={project.id}>
                      <Link 
                        to={"/projects/" + project.id} 
                      >
                        <SidebarMenuButton isActive={currentPath === `/projects/${project.id}`}>
                          {project.name}
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            {/* Settings menu item */}
            <SidebarMenuItem>
              <Link to="/settings">
                <SidebarMenuButton isActive={isActive("/settings")}> 
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">{/* Footer content here */}</SidebarFooter>
    </Sidebar>
  );
} 