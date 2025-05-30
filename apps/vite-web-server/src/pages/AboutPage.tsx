import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Sparkles, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
            <span className="text-4xl font-bold">🧩</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            About One Logger
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A powerful, modern logging dashboard designed to help you monitor, analyze, and manage your application logs with ease.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white w-fit">
                <Info className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Monitor your application logs in real-time with live updates and instant notifications.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white w-fit">
                <Sparkles className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">Smart Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Advanced analytics and insights to help you understand your application's behavior.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl text-white w-fit">
                <Heart className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">User-Friendly</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Intuitive interface designed with developers in mind for maximum productivity.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Version Info */}
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Version Information</h3>
                <p className="text-gray-600">Current application version and build details</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  v1.0.0
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  Beta
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}