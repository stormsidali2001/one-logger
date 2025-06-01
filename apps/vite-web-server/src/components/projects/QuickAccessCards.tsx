import { Link, useLocation } from "@tanstack/react-router";
import { FileText, Activity, ExternalLink } from "lucide-react";

interface QuickAccessCardsProps {
  projectId: string;
  currentPage?: 'details' | 'logs' | 'traces';
}

export function QuickAccessCards({ projectId, currentPage }: QuickAccessCardsProps) {
  const location = useLocation();
  
  // Determine current page from location if not explicitly provided
  const getCurrentPage = () => {
    if (currentPage) return currentPage;
    if (location.pathname.includes('/logs')) return 'logs';
    if (location.pathname.includes('/traces')) return 'traces';
    return 'details';
  };
  
  const current = getCurrentPage();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Logs Card */}
      <Link 
        to="/projects/$projectId/logs" 
        params={{ projectId }}
        className={`group bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 ${
          current === 'logs' ? 'ring-2 ring-blue-500 bg-blue-50/30' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              current === 'logs' 
                ? 'bg-blue-200 group-hover:bg-blue-300' 
                : 'bg-blue-100 group-hover:bg-blue-200'
            }`}>
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Logs</h3>
              <p className="text-sm text-gray-600">
                {current === 'logs' 
                  ? 'Currently viewing logs - manage and filter entries'
                  : 'View and manage application logs'
                }
              </p>
            </div>
          </div>
          <ExternalLink className={`h-5 w-5 transition-colors ${
            current === 'logs'
              ? 'text-blue-600'
              : 'text-gray-400 group-hover:text-blue-600'
          }`} />
        </div>
      </Link>

      {/* Traces Card */}
      <Link 
        to="/projects/$projectId/traces" 
        params={{ projectId }}
        className={`group bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-lg rounded-lg p-6 hover:shadow-xl transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 ${
          current === 'traces' ? 'ring-2 ring-purple-500 bg-purple-50/30' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-colors ${
              current === 'traces' 
                ? 'bg-purple-200 group-hover:bg-purple-300' 
                : 'bg-purple-100 group-hover:bg-purple-200'
            }`}>
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Project Traces</h3>
              <p className="text-sm text-gray-600">
                {current === 'traces' 
                  ? 'Currently viewing traces - analyze distributed requests'
                  : 'Analyze distributed tracing data'
                }
              </p>
            </div>
          </div>
          <ExternalLink className={`h-5 w-5 transition-colors ${
            current === 'traces'
              ? 'text-purple-600'
              : 'text-gray-400 group-hover:text-purple-600'
          }`} />
        </div>
      </Link>
    </div>
  );
}