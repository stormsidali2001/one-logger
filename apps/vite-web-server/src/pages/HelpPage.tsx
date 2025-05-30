import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  ExternalLink, 
  Search,
  Settings,
  FolderOpen,
  BarChart3,
  Zap
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function HelpPage() {
  const helpSections = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "from-green-500 to-teal-500",
      items: [
        "Create your first project",
        "Configure logging endpoints",
        "Set up real-time monitoring",
        "Understand the dashboard"
      ]
    },
    {
      title: "Projects",
      icon: FolderOpen,
      color: "from-blue-500 to-cyan-500",
      items: [
        "Managing project settings",
        "Viewing project logs",
        "Configuring log filters",
        "Exporting log data"
      ]
    },
    {
      title: "Analytics",
      icon: BarChart3,
      color: "from-purple-500 to-pink-500",
      items: [
        "Understanding metrics",
        "Creating custom dashboards",
        "Setting up alerts",
        "Performance monitoring"
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      color: "from-orange-500 to-red-500",
      items: [
        "Server configuration",
        "User preferences",
        "Security settings",
        "Integration setup"
      ]
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Help & Documentation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to your questions and learn how to make the most of One Logger.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white w-fit mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Search Documentation</h3>
              <p className="text-sm text-gray-600 mb-4">Find specific topics and guides</p>
              <Button variant="outline" size="sm" className="w-full">
                Search Docs
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white w-fit mb-4">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">User Guide</h3>
              <p className="text-sm text-gray-600 mb-4">Complete step-by-step tutorials</p>
              <Button variant="outline" size="sm" className="w-full">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white w-fit mb-4">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Get Support</h3>
              <p className="text-sm text-gray-600 mb-4">Contact our support team</p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Us
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Help Sections */}
        <div className="grid gap-6 md:grid-cols-2">
          {helpSections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <Card key={index} className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${section.color} rounded-lg text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" size="sm" className="mt-4 w-full justify-between">
                    Learn More
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-gray-50/50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">How do I create a new project?</h4>
                <p className="text-sm text-gray-600">
                  Navigate to the Projects page and click the "Create Project" button. Fill in the required details and configure your logging settings.
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Can I export my log data?</h4>
                <p className="text-sm text-gray-600">
                  Yes, you can export log data in various formats including JSON, CSV, and plain text from the project details page.
                </p>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">How do I set up real-time monitoring?</h4>
                <p className="text-sm text-gray-600">
                  Real-time monitoring is enabled by default. Configure your logging endpoints in the project settings to start receiving live updates.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <Button asChild className="w-full">
                <Link to="/">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}